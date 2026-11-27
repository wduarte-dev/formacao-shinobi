"""Regressões da seleção de QA, sem precisar abrir o navegador."""
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from qa_diff import select_tasks


class SelectTasksTest(unittest.TestCase):
    def test_atlas_uses_saved_scenarios(self):
        tasks = dict(select_tasks({'spr/kaen_atlas.png'}))
        self.assertEqual(set(tasks), {'retratos', 'kaen-meteoro', 'kaen-meteoro-ko'})
        self.assertEqual(tasks['retratos'][-1], 'kaen')
        self.assertIn('--expect-ko', tasks['kaen-meteoro-ko'])

    def test_new_ninja_uses_own_jutsu(self):
        tasks = dict(select_tasks({'spr/ninja_novo_atlas.png'}))
        self.assertEqual(tasks['retratos'][-1], 'ninja_novo')
        self.assertEqual(tasks['ninja_novo-jutsu'][-2:], ['--kind', 'jutsu'])

    def test_shared_style_checks_entire_roster_once(self):
        tasks = dict(select_tasks({'css/style.css', 'spr/kaen_atlas.png'}))
        self.assertEqual(tasks['retratos'][1:], ['tools/qa_retratos.py'])

    def test_new_game_module_runs_syntax_and_scenarios(self):
        new_module = 'js/mecanica_nova.js'
        with tempfile.TemporaryDirectory() as path:
            root = Path(path)
            (root / 'js').mkdir()
            (root / new_module).touch()
            with patch('qa_diff.ROOT', root):
                tasks = dict(select_tasks({new_module}))
        self.assertEqual(tasks['sintaxe-js-mecanica_nova.js'], ['node', '--check', new_module])
        self.assertIn('utsushi-rajada-3', tasks)
        self.assertIn('fuuka-tufao', tasks)
        self.assertEqual(tasks['prova'][1:], ['tools/prova.py'])

    def test_atlas_alone_skips_full_battle(self):
        self.assertNotIn('prova', dict(select_tasks({'spr/kaen_atlas.png'})))

    def test_documentation_selects_no_game_checks(self):
        self.assertEqual(select_tasks({'tools/README.md'}), [])


if __name__ == '__main__':
    unittest.main()
