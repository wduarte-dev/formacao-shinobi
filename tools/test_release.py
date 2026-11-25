from pathlib import Path
import shutil
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest

from release import NOTES, ROOT, next_version


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        temp = TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        for directory in ('tools', 'js', 'docs'):
            (self.root / directory).mkdir()
        for name in ('release.py', 'patch_notes.py', 'bump_version.py'):
            shutil.copyfile(ROOT / 'tools' / name, self.root / 'tools' / name)
        self.write('version.json', '{"v": "1.5", "d": "01/01/2026"}\n')
        self.write('js/data.js', "const VERSION={v:'1.5',d:'01/01/2026'};\n")
        self.write('js/patch.js', '// versão anterior\n')
        self.write(NOTES, '## 1.5\n- Notas anteriores\n')
        self.write('outro', 'original')
        self.git('init', '-q')
        self.git('config', 'user.name', 'QA')
        self.git('config', 'user.email', 'qa@example.invalid')
        self.git('add', '.')
        self.git('commit', '-qm', 'Versão 1.5')

    def write(self, path, content):
        (self.root / path).write_text(content, encoding='utf-8')

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root).decode().strip()

    def run_release(self, *args):
        return subprocess.run([sys.executable, 'tools/release.py', *args],
                              cwd=self.root, capture_output=True, text=True)

    def test_version_rules(self):
        self.assertEqual(next_version('1.5', True), '1.6')
        self.assertEqual(next_version('1.5', False), '1.5.1')
        self.assertEqual(next_version('1.5.9', True), '1.6')
        self.assertEqual(next_version('1.5.9', False), '1.5.10')

    def test_dry_run_and_notes_guard(self):
        plan = self.run_release('--grande', '--dry-run', '--commit')
        self.assertEqual(plan.returncode, 0, plan.stderr)
        self.assertIn('1.5 → 1.6', plan.stdout)
        self.assertIn('git commit', plan.stdout)
        real = self.run_release('--grande')
        self.assertEqual(real.returncode, 1, real.stderr)
        self.assertIn('sem alterações desde a versão 1.5', real.stdout)
        self.assertEqual(self.git('status', '--short'), '')
        self.assertEqual(self.git('rev-list', '--count', 'HEAD'), '1')

    def test_stops_at_first_failure_with_log(self):
        self.write(NOTES, '## 1.5.1\n- Nova correção\n')
        self.write('tools/qa_diff.py', "print('falha de exemplo')\nraise SystemExit(7)\n")
        result = self.run_release('--pequeno')
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn('Falhou qa_diff.py (código 7)', result.stdout)
        self.assertNotIn('test_battle.py', result.stdout)
        log = Path(result.stdout.strip().split(' | log ')[-1])
        self.assertIn('falha de exemplo', log.read_text())
        self.assertIn('"1.5"', (self.root / 'version.json').read_text())

    def test_restores_generated_files_if_bump_fails_partway(self):
        self.write(NOTES, '## 1.5.1\n- Nova correção\n')
        self.write('tools/qa_diff.py', '')
        self.write('tools/test_battle.py', '')
        self.write('tools/bump_version.py', "open('version.json', 'w').close()\nraise SystemExit(3)\n")
        result = self.run_release('--pequeno')
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn('Falhou bump_version.py (código 3)', result.stdout)
        self.assertEqual(self.git('diff', '--name-only', '--', 'js', 'version.json'), '')
        self.assertIn(NOTES, self.git('diff', '--name-only'))

    def test_success_updates_version_and_only_commits_with_flag(self):
        self.write(NOTES, '## 1.5.1\n- Nova correção\n')
        base = self.git('rev-parse', 'HEAD')
        self.write('tools/qa_diff.py',
                   f"import sys\nassert sys.argv[1:] == ['--base', {base!r}]\n")
        self.write('tools/test_battle.py', "import sys\nassert sys.argv[1] == '.' and sys.argv[-1] == '--strict'\n")
        result = self.run_release('--pequeno')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(self.git('rev-list', '--count', 'HEAD'), '1')
        self.assertEqual([line.split()[1] for line in result.stdout.splitlines()[2:]],
                         ['qa_diff.py', 'test_battle.py', 'patch_notes.py', 'bump_version.py'])
        self.assertIn('Nova correção', (self.root / 'js/patch.js').read_text())
        self.assertIn("v:'1.5.1'", (self.root / 'js/data.js').read_text())

        self.git('restore', 'js/data.js', 'version.json', 'js/patch.js')
        self.write('outro', 'edição independente')
        self.git('add', 'outro')
        result = self.run_release('--pequeno', '--commit')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(set(self.git('show', '--format=', '--name-only', 'HEAD').splitlines()),
                         {NOTES, 'js/data.js', 'js/patch.js', 'version.json'})
        self.assertIn('M  outro', self.git('status', '--short'))
        self.assertIn('"1.5.1"', (self.root / 'version.json').read_text())


if __name__ == '__main__':
    unittest.main()
