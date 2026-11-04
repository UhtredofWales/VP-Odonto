export const BRAND = {
  name: "Dr. Vitor H. Parra",
  especialist: "Cirurgião-Dentista",
  cro: "CRO-SP 121.046",
  primaryColor: "#0EA5E9",
  secondaryColor: "#0284C7",
};

export const DENTAL_CASES = [
  { 
    id: "lentes", 
    label: "Lentes de Contato / Facetas", 
    topCaptions: [
      "O poder de uma transformação estética",
      "Sua melhor versão começa no seu sorriso",
      "Harmonia, naturalidade e perfeição em cada detalhe",
      "A arte da odontologia estética ao seu alcance"
    ],
    postCaptions: [
      "As lentes de contato dentais devolvem a simetria, a cor e a confiança do seu sorriso com máxima preservação natural. Agende sua consulta de avaliação!",
      "Transformação concluída com sucesso! Cada detalhe planejado digitalmente para garantir um resultado elegante e harmonioso. Gostou do resultado?",
      "Design de sorriso personalizado: tecnologia de ponta aliada à arte odontológica para criar o sorriso dos seus sonhos."
    ]
  },
  { 
    id: "orto", 
    label: "Ortodontia / Alinhadores", 
    topCaptions: [
      "Alinhando sorrisos e transformando vidas",
      "O sorriso alinhado que você sempre quis",
      "Tecnologia invisível para o seu novo sorriso",
      "Sua jornada para um sorriso perfeito começa aqui"
    ],
    postCaptions: [
      "Alinhar seus dentes vai muito além da estética: melhora a mastigação, a higiene e a sua qualidade de vida. Venha conhecer nossos tratamentos!",
      "Aparelhos e alinhadores invisíveis projetados para se adaptarem à sua rotina com conforto e discrição.",
      "Mais um passo em direção ao sorriso ideal. Agende sua avaliação e descubra o plano de tratamento perfeito para você."
    ]
  },
  { 
    id: "clareamento", 
    label: "Clareamento Dental", 
    topCaptions: [
      "O brilho que faltava no seu sorriso",
      "Ilumine seu sorriso de forma segura e duradoura",
      "Sorriso renovado, radiante e natural",
      "Realce a beleza natural dos seus dentes"
    ],
    postCaptions: [
      "O clareamento dental supervisionado garante um resultado brilhante sem agredir a estrutura do esmalte nem causar sensibilidade excessiva.",
      "Um sorriso mais claro renova a autoestima e ilumina a sua expressão. Agende sua sessão e sinta a diferença!",
      "Resultados visíveis com máxima segurança. Traga o brilho de volta ao seu dia a dia."
    ]
  },
  { 
    id: "extracao", 
    label: "Cirurgia / Extração", 
    topCaptions: [
      "Procedimento seguro, indolor e humanizado",
      "Cuidado, precisão e conforto do início ao fim",
      "Sua saúde bucal em primeiro lugar",
      "Atendimento especializado e acolhedor"
    ],
    postCaptions: [
      "Realizar procedimentos cirúrgicos com técnicas minimamente invasivas garante um pós-operatório tranquilo e uma recuperação rápida.",
      "Sua segurança e bem-estar são prioridade máxima. Conte com um planejamento minucioso para o seu tratamento.",
      "Procedimentos cirúrgicos conduzidos com tecnologia e sensibilidade para o seu total conforto."
    ]
  },
  { 
    id: "resina", 
    label: "Resina Composta / Restauração", 
    topCaptions: [
      "Estética e naturalidade em cada detalhe",
      "Recuperando a forma e a função do seu dente",
      "Esculpindo sorrisos com precisão artesanal",
      "Restauração imperceptível e duradoura"
    ],
    postCaptions: [
      "A resina composta permite restaurações biomecanicamente compatíveis e visualmente imperceptíveis em uma única sessão.",
      "Devolver a anatomia original do dente preservando a estrutura saudável: essa é a essência da odontologia conservadora.",
      "Detalhes que fazem toda a diferença. Recupere a estética e a força funcional do seu sorriso."
    ]
  },
  { 
    id: "implante", 
    label: "Implantes Dentários", 
    topCaptions: [
      "Recupere sua autoestima e a função mastigatória",
      "A solução definitiva para dentes perdidos",
      "Sorria e mastigue com total segurança",
      "Sua mastigação e sorriso reabilitados"
    ],
    postCaptions: [
      "Os implantes dentários oferecem estabilidade, conforto e aparência idêntica aos dentes naturais. Recupere o prazer de sorrir e comer bem!",
      "Reabilitação oral completa com planejamento guiado por computador para cirurgias mais precisas e indolores.",
      "Volte a sorrir com confiança! Descubra como os implantes podem transformar a sua saúde bucal."
    ]
  }
];

export const FORMAT_OPTIONS = [
  { id: "feed-square", label: "Feed Quadrado (1:1)", width: 1080, height: 1080, ratio: "1 / 1" },
  { id: "feed-portrait", label: "Feed Retrato (4:5)", width: 1080, height: 1350, ratio: "4 / 5" },
  { id: "story", label: "Story / Reels (9:16)", width: 1080, height: 1920, ratio: "9 / 16" }
];