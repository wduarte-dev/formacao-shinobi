import subprocess
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from PIL import Image, ImageDraw

from qa_atlas_diff import CH, CW, changed_atlases, compare, measure, registry


SOURCE = """const V2={
 kaen:{hd:[96,55],W:2304,H:320,a:{idle:[0,2,6,1,0],hit:[1,3,12,0,0,[0,2,1]]}},
};"""


class AtlasDiffTests(unittest.TestCase):
    def setUp(self):
        temp = TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        (self.root / 'spr').mkdir()
        self.path = self.root / 'spr/kaen_atlas.png'
        self.spec = registry(SOURCE)
        self.git('init', '-q')
        self.git('config', 'user.name', 'QA')
        self.git('config', 'user.email', 'qa@example.invalid')
        (self.root / 'base').touch()
        self.git('add', 'base')
        self.git('commit', '-qm', 'Base')

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root).decode().strip()

    def image(self):
        image = Image.new('RGBA', (12 * CW, 2 * CH))
        draw = ImageDraw.Draw(image)
        for row, count in enumerate((2, 3)):
            for col in range(count):
                x, y = col * CW, row * CH
                draw.rectangle((x + 90, y + 70, x + 102, y + 149), fill='white')
        return image

    def test_pivot_empty_and_sequence_jump(self):
        animation = self.spec['kaen'].animations['hit']
        row = Image.new('RGBA', (12 * CW, CH))
        draw = ImageDraw.Draw(row)
        draw.rectangle((90, 70, 102, 149), fill='white')
        draw.rectangle((2 * CW + 120, 74, 2 * CW + 132, 153), fill='white')
        stats = measure(row, animation)
        self.assertEqual(self.spec['kaen'].columns, 12)
        self.assertEqual(animation.fps, 12)
        self.assertEqual(stats.offsets, {1: (0, 0), 3: (30, 4)})
        self.assertEqual(stats.empty, [2])
        self.assertAlmostEqual(stats.jump, 30.26549, places=4)
        self.assertTrue(stats.exceeds(100))
        stats.empty = []
        stats.offsets[3] = (3, -3)
        self.assertTrue(stats.exceeds(24))
        self.assertFalse(stats.exceeds(24, new_atlas=True))
        self.assertFalse(stats.exceeds(stats.jump))

    def test_diff_detects_untracked_new_atlas_then_only_changed_row(self):
        image = self.image()
        image.save(self.path)
        self.assertEqual(changed_atlases(self.root, 'HEAD'), ['kaen'])
        lines, _, failed = compare(self.root, self.git('rev-parse', 'HEAD'), self.spec, {},
                                   'kaen', 24, self.root)
        self.assertEqual(len(lines), 2)
        self.assertFalse(any('salto' in line for line in lines))
        self.assertFalse(failed)
        self.assertFalse((self.root / 'kaen.png').exists())
        self.git('add', 'spr')
        self.git('commit', '-qm', 'Atlas')

        image.putpixel((96, CH + 100), (255, 0, 0, 255))
        image.save(self.path)
        self.assertEqual(changed_atlases(self.root, 'HEAD'), ['kaen'])
        lines, _, failed = compare(self.root, self.git('rev-parse', 'HEAD'), self.spec, self.spec,
                                   'kaen', 24, self.root)
        self.assertEqual(len(lines), 1)
        self.assertIn('kaen/hit L1 3q 12fps', lines[0])
        self.assertFalse(failed)
        with Image.open(self.root / 'kaen.png') as board:
            self.assertEqual(board.size, (12 * CW // 3, 2 * (CH // 3 + 17)))


if __name__ == '__main__':
    unittest.main()
