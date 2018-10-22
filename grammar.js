// QML language grammar
// ====================
// Reference: http://code.qt.io/cgit/qt/qtdeclarative.git/tree/src/qml/parser/qqmljs.g?h=5.12

module.exports = grammar(require('tree-sitter-javascript/grammar'), {
    name: 'qml',

    conflicts: ($, previous) => previous.concat([

    ]),

    inline: ($, previous) => previous.concat([

    ]),

    rules: {
        program: $ => seq(
            optional(repeat(choice(
                $.pragma_statement,
                $.import_statement
            ))),
            $.object_declaration
        ),

        //
        // Header items
        //

        pragma_statement: $ => seq(
            'pragma',
            alias($.identifier, $.pragma_identifier),
            $._semicolon
        ),

        import_statement: ($, previous) => seq(
            'import',
            alias($.qml_member_expression, $.qml_import_identifier),
            optional($.number),
            optional($.named_import),
            $._semicolon
        ),

        named_import: $ => seq(
            'as', $.identifier
        ),

        //
        // Object definitions
        //

        object_declaration: $ => seq(
            $._qualified_id, $.object_block
        ),

        object_block: $ => seq(
            '{',
            repeat(choice(
                $.object_declaration,
                $.signal_declaration,
                $.property_declaration,
                $.enum,
                seq($._qualified_id, ':', $.property_value),
                seq($._qualified_id, 'on', $._qualified_id, $.object_block),
                $.function,
                $.variable_declaration
            )),
            '}'
        ),

        signal_declaration: $ => seq(
            'signal', $.identifier, optional($.formal_parameters), $._semicolon
        ),

        property_declaration: $ => seq(
            choice(
                seq($.property_declarator, optional(seq(':', $.script_statement))),
                seq('default', $.property_declarator),
                seq('readonly', $.property_declarator, ':', $.script_statement)
            ),
            $._semicolon
        ),

        property_type: $ => choice(
            'var',
            reservedword,
            $.identifier,
            seq($.property_type, '.', $.identifier),
        ),

        property_declarator: $ => seq(
            'property',
            choice(
                $.property_type,
                seq($.identifier, '<', $.property_type, '>'),
            ),
            $.identifier
        ),

        property_value: $ => seq(
            ':',
            choice(
                $.script_statement,
                $.object_declaration,
                seq('[', commaSep1($.object_declaration), ']'),
            )
        ),

        enum: $ => seq(
            'enum',
            $.identifier,
            '{',
            commaSep($.enum_member),
             '}'
        ),

        enum_member: $ => seq(
            $.identifier,
            optional(seq('=', $.number))
        ),

        //
        // Statements
        //

        script_statement: $ => choice(
            $.statement_block,
            $.empty_statement,
            $.expression_statement,
            $.if_statement,
            $.with_statement,
            $.switch_statement,
            $.try_statement
        ),

        // Expressions

        literal: $ => choice(
            $.null,
            $.true,
            $.false,
            $.number,
            $.string,
            $.template_string
        ),

        primary_expression: $ => choice(
            $.this,
            $._identifier_reference,
            $.literal,
            $.array,
            $.object,
            $.function,
            $.class,
            $.arrow_function,
            $.generator_function,
            $.regex
        ),

        // dunno what this thing is but it appeared in parser rule
        meta_property: $ => seq(
            'new', '.', $.identifier
        ),

        qml_member_expression: $ => choice(
            $.primary_expression,
            $.subscript_expression,
            $.member_expression,
            $.meta_property,
            $.new_expression,
            seq($.qml_member_expression, $.template_string)
        ),

        // Identifiers

        _qualified_id: $ => alias($.qml_member_expression, $.identifier),

    }
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}
