module.exports = grammar({
    name: 'qml',
    rules: {

        // === File structure ===

        source_file: $ => seq(
            $.ui_header_item,
            $.ui_root_item
        ),

        ui_header_item: $ => repeat(
            $.uiPragma,
            $.uiImport,
        ),

        // === Primary Expressions ===

        identifier: /[a-zA-Z$_\p{Nl}\p{Lu}\p{Ll}\p{Lt}\p{Lm}\p{Lo}][a-zA-Z0-9$_\u200c\u200d\p{Mn}\p{Mc}\p{Nd}\p{Nl}\p{Lu}\p{Ll}\p{Lt}\p{Lm}\p{Lo}\p{Pc}]*/,
        // reference: http://code.qt.io/cgit/qt/qtdeclarative.git/tree/src/qml/parser/qqmljslexer.cpp?h=5.12#n398
        // identifier start: Unicode Nl Lu Ll Lt Lm Lo
        // identifier part: Unicode Mn Mc Nd Nl Lu Ll Lt Lm Lo Pc

        primary_expression: choice(
            'this',
            'identifier reference',
            'literal',
            'array literal',
            'object literal',
            'function expression',
            'class expression',
            'generator expression',
            'regex literal',
            'template literal',
            'CoverParenthesizedExpressionAndArrowParameterList',
        )

        qml_identifier: $ => choice(
            $.identifier,
            'property',
            'signal',
            'readonly',
            'on',
            'get',
            'set',
            'from',
            'of'
        ),

        js_Identifier: $ => choice(
            $.identifier,
            'property',
            'signal',
            'readonly',
            'on',
            'get',
            'set',
            'from',
            'static'
            'of',
            'as'
        )
    }
});
