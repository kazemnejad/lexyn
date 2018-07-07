
# -----------------------------------------------------------------------------
# calc.py
#
# A simple calculator with variables -- all in one file.
# -----------------------------------------------------------------------------


import sys

import keyword
import ply.lex
from ply.lex import TOKEN

reserved = {}
for (k, t) in zip(keyword.kwlist, keyword.kwlist):
    reserved[k] = 'KW_'+t.upper()

tokens = [
    'ID',
    'NUM_INT',
    'NUM_REAL',
    'LT',
    'LE',
    'GT',
    'GE',
    'ASSIGNMENT',
    'EQUAL',
    'NOT_EQ',
    'PLUS',
    'MINUS',
    'MUL',
    'DIV',
    'MOD',
    'POWER',
    'BIN_AND',
    'BIN_OR',
    'OPEN_PAR',
    'CLOSE_PAR',
    'OPEN_BRACK',
    'CLOSE_BRACK',
    'SEMICOLON',
    'DOUBLE_DOT',
    'SINGLE_COMMENT',
    'MULTI_COMMENT',
    'SINGLE_QUOTE_STR',
    'DOUBLE_QUOTE_STR',
    'STRING',
] + list(reserved.values())


L = r'([_A-Za-z])'
identifier = r'(%s(%s|\d)*)' % (L, L)


def t_STRING(t):
    r'(\"[^\"]((\\.)|[^\"\\])*\"|\'[^\']((\\.)|[^\'\\])*\')'
    t.type = 'STRING'
    t.value = t.value[1:-1]
    return t


def t_MULTI_COMMENT(t):
    r"""(\"\"\"([^\"\\]|\\.|\"([^\"\\]|\\.)|\"\"([^\"\\]|\\.))*\"\"\"|\'\'\'([^\'\\]|\\.|\'([^\'\\]|\\.)|\'\'([^\'\\]|\\.))*\'\'\')"""
    t.value = t.value[3:-3]
    return t


def t_SINGLE_COMMENT(t):
    r'([#].*\n)'
    t.value = t.value[1:-1]
    return t


@TOKEN(identifier)
def t_ID(t):
    t.type = reserved.get(t.value, t.type)
    return t


t_NUM_INT = r'(\d+)'
t_NUM_REAL = r'(\d*\.\d*)'
t_LT = r'(<)'
t_LE = r'(<=)'
t_GT = r'(>)'
t_GE = r'(>=)'
t_ASSIGNMENT = r'(=)'
t_EQUAL = r'(==)'
t_NOT_EQ = r'(!=)'
t_PLUS = r'(\+)'
t_MINUS = r'(-)'
t_MUL = r'(\*)'
t_DIV = r'(/)'
t_MOD = r'(%)'
t_POWER = r'(\*\*)'
t_BIN_AND = r'(&)'
t_BIN_OR = r'(\|)'
t_OPEN_PAR = r'(\()'
t_CLOSE_PAR = r'(\))'
t_OPEN_BRACK = r'(\[)'
t_CLOSE_BRACK = r'(\])'
t_SEMICOLON = r'(;)'
t_DOUBLE_DOT = r'(:)'

t_ignore = " \t\n"


def t_newline(t):
    r'\n+'
    t.lexer.lineno += t.value.count("\n")


def t_error(t):
    print("Illegal character '%s'" % t.value[0])
    t.lexer.skip(1)


# Build the lexer
import ply.lex as lex
lexer = lex.lex()

if __name__ == '__main__':
    src = sys.argv[1]
    dst = sys.argv[2]

    source_text = open(src, 'r').read()
    lexer.input(source_text)

    with open(dst, 'w') as f:
        for t in lexer:
            f.write(str(t))
            f.write('\n')
