export const terminalContent = [
  {
    chapter: 'solutions',
    interval: 45,
    code: [
      'nome = "João Victor"',
      'print(f"Hellow, meu nome é {nome}.")',
      'print("Sou Desenvolvedor DevOps")',
      'print("e esse é meu portfólio.")',
    ].join('\n'),
    output: 'Hellow, meu nome é João Victor.\nSou Desenvolvedor DevOps\ne esse é meu portfólio.',
  },
  {
    chapter: 'engineering',
    interval: 32,
    code: [
      'obra = "Melencolia I"',
      'def contemplar():',
      '    return ("Nem toda pausa é desistência.\\n"',
      '            "Entre a dúvida e a criação,\\n"',
      '            "o estudo transforma\\n"',
      '            "inquietação em caminho.")',
      'print(contemplar())',
    ].join('\n'),
    output:
      'Nem toda pausa é desistência.\nEntre a dúvida e a criação,\no estudo transforma\ninquietação em caminho.',
  },
];
