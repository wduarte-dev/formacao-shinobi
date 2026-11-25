from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import unittest

from estado import MAX_LINES, OUTPUT, generate


class EstadoTests(unittest.TestCase):
    def setUp(self):
        temp = TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        for directory in ('js', 'docs/sub', 'spr', 'audio/sfx'):
            (self.root / directory).mkdir(parents=True)
        self.write('js/data.js', """const N={
 a:{name:'Ninja A',el:'Água',role:'Suporte'},
 b:{name:'Ninja B',el:'Terra',role:'Tanque'},
};
const VERSION={v:'1.5',d:'01/01/2026'};
""")
        self.write('version.json', '{"v":"1.5.1","d":"02/01/2026"}\n')
        for path in ('spr/a_atlas.png', 'spr/b_fx.png', 'audio/sfx/voz-a-dor_1.ogg'):
            (self.root / path).touch()
        self.git('init', '-q')
        self.git('config', 'user.name', 'QA')
        self.git('config', 'user.email', 'qa@example.invalid')
        self.git('add', '.')
        self.git('commit', '-qm', 'Base', '-m', 'Pendente: antiga demais')
        for index in range(20):
            self.git('commit', '--allow-empty', '-qm', f'Commit {index:02d}',
                     '-m', f'Pendente: commit {index:02d}')

    def write(self, path, content):
        (self.root / path).write_text(content, encoding='utf-8')

    def git(self, *args):
        subprocess.run(['git', *args], cwd=self.root, capture_output=True, check=True)

    def test_is_byte_identical_and_extracts_versions_assets_and_history(self):
        self.write('docs/sub/notas.md', '# Notas\n- **Pendente:** conferir arte\n')
        self.write(OUTPUT, 'Pendente: arquivo gerado anterior\n')
        output, count = generate(self.root)
        first = output.read_bytes()
        self.assertEqual(generate(self.root), (output, 21))
        self.assertEqual(count, 21)
        self.assertEqual(output.read_bytes(), first)
        text = first.decode('utf-8')
        self.assertIn('`js/data.js` 1.5 · 01/01/2026', text)
        self.assertIn('`version.json` 1.5.1 · 02/01/2026', text)
        self.assertIn('| Ninja A | Água | Suporte | Sim | Não | Sim |', text)
        self.assertIn('| Ninja B | Terra | Tanque | Não | Sim | Não |', text)
        self.assertIn('docs/sub/notas.md:2` Pendente: conferir arte', text)
        self.assertIn('Pendente: commit 00', text)
        self.assertNotIn('antiga demais', text)
        self.assertNotIn('arquivo gerado anterior', text)
        history = text.split('## Últimos 10 commits')[1].split('## Pendências')[0]
        self.assertEqual(history.count('\n- '), 10)
        self.assertIn('Commit 10', history)
        self.assertNotIn('Commit 09', history)

    def test_limits_document_without_losing_total_count(self):
        self.write('docs/sub/longa.md', 'Pendente: nota\n' * 100)
        output, count = generate(self.root)
        lines = output.read_text(encoding='utf-8').splitlines()
        self.assertEqual(count, 120)
        self.assertEqual(len(lines), MAX_LINES)
        self.assertIn('## Pendências (120)', lines)
        self.assertIn('pendências fora do limite', lines[-1])


if __name__ == '__main__':
    unittest.main()
