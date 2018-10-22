// QML language grammar
// ====================
// Reference: http://code.qt.io/cgit/qt/qtdeclarative.git/tree/src/qml/parser/qqmljs.g?h=5.12

module.exports = grammar(require('tree-sitter-javascript/grammar'), {
    name: 'qml',

    conflicts: ($, previous) => previous.concat([

    ]),

    inline: ($, previous) => previous.concat([
        $._qualified_identifier,
        $._type_identifier
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
            'as', alias($.identifier, $.type_identifier)
        ),

        //
        // QML Object
        //

        object_declaration: $ => seq(
            $._qualified_identifier, $.object_block
        ),

        object_block: $ => seq(
            '{',
            repeat(choice(
                $.object_declaration,
                $.signal_declaration,
                $.property_declaration,
                $.enum,
                seq($._qualified_id, ':', $.property_value),
                seq($._qualified_identifier, 'on', $._qualified_identifier, $.object_block),
                $.function,
                $.variable_declaration
            )),
            '}'
        ),

        //
        // QML Signal
        //

        signal_declaration: $ => seq(
            'signal', $.identifier, optional($.signal_parameters), $._semicolon
        ),

        signal_parameters: $ => seq(
            '(', commaSep(seq($.property_type, $.identifier)), ')'
        ),

        //
        // QML Property
        //

        property_declaration: $ => seq(
            choice(
                seq($.property_declarator, optional(seq(':', $.script_statement))),
                seq('default', $.property_declarator),
                seq('readonly', $.property_declarator, ':', $.script_statement)
            ),
            $._semicolon
        ),

        property_declarator: $ => seq(
            'property',
            choice(
                $.property_type,
                seq($._type_identifier, '<', $.property_type, '>')
            ),
            alias($.identifier, $.property_identifier)
        ),

        property_type: $ => choice(
            'var',
            $._reserved_identifier,
            $._type_identifier,
            seq($.property_type, '.', $.property_type)
        ),

        property_value: $ => seq(
            ':',
            choice(
                $.script_statement,
                $.object_declaration,
                seq('[', commaSep1($.object_declaration), ']'),
            )
        ),

        //
        // QML Enum
        //

        enum: $ => seq(
            'enum',
            $._type_identifier,
            '{',
            commaSep1($.enum_member),
             '}'
        ),

        enum_member: $ => seq(
            $._property_identifier,
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

        //
        // Expressions
        //

        // dunno what this thing is but it appeared in parser rule
        meta_property: $ => seq(
            'new', '.', $.identifier
        ),

        primary_expression: $ => choice(
            $.this,
            $._identifier_reference,

            $.null,
            $.true,
            $.false,
            $.number,
            $.string,
            $.template_string,

            $.array,
            $.object,
            $.function,
            $.class,
            $.arrow_function,
            $.generator_function,
            $.regex
        ),

        qml_member_expression: $ => choice(
            $.primary_expression,
            $.subscript_expression,
            $.member_expression,
            $.meta_property,
            $.new_expression,
            seq($.qml_member_expression, $.template_string)
        ),

        //
        // Identifiers
        //

        _qualified_identifier: $ => alias($.qml_member_expression, $.qualified_identifier),

        _type_identifier: $ => alias($.identifier, $.type_identifier),

        _reserved_identifier: ($, previous) => choice(
            'enum',
            previous
        )

    }
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}
