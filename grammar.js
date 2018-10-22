// QML language grammar
// ====================
// Reference: http://code.qt.io/cgit/qt/qtdeclarative.git/tree/src/qml/parser/qqmljs.g?h=5.12
const PREC = {
    QUALIFIED_ID: 14
}

module.exports = grammar(require('tree-sitter-javascript/grammar'), {
    name: 'qml',

    conflicts: ($, previous) => previous.concat([

    ]),

    inline: ($, previous) => previous.concat([
        $.qualified_identifier,
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
            $.identifier,
            $._semicolon
        ),

        import_statement: ($, previous) => seq(
            'import',
            $.qualified_identifier,
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
            $.qualified_identifier, $.object_block
        ),

        object_block: $ => seq(
            '{',
            repeat(choice(
                $.object_declaration,
                $.signal_declaration,
                $.property_declaration,
                $.enum,
                seq($.qualified_identifier, ':', $.property_value),
                seq($.qualified_identifier, 'on', $.qualified_identifier, $.object_block),
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
            seq($.property_type, '.', $._type_identifier)
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

        //
        // Expressions
        //

        qualified_identifier: $ => prec(PREC.QUALIFIED_ID, choice(
            $.identifier,
            $.string,
            $.number,
            seq(choice($.qualified_identifier, $.super), '.', $.identifier),
        )),

        //
        // Identifiers
        //

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
