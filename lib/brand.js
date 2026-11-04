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
    categoryTitle: "LENTES DE CONTATO",
    topCaptions: [
      "Volte a sorrir com excelência.",
      "O poder de uma transformação estética",
      "Harmonia, naturalidade e perfeição em cada detalhe"
    ],
    postCaptions: [
      "As lentes de contato dentais devolvem a simetria, a cor e a confiança do seu sorriso com máxima preservação natural.",
      "Transformação concluída com sucesso! Cada detalhe planejado digitalmente para garantir um resultado elegante."
    ]
  },
  { 
    id: "orto", 
    label: "Ortodontia / Alinhadores", 
    categoryTitle: "NOVA ABORDAGEM EM ORTODONTIA",
    topCaptions: [
      "Alcançando a perfeição com a mais recente tecnologia.",
      "Alinhando sorrisos e transformando vidas",
      "Tecnologia invisível para o seu novo sorriso"
    ],
    postCaptions: [
      "Alinhar seus dentes vai muito além da estética: melhora a mastigação, a higiene e a sua qualidade de vida.",
      "Aparelhos e alinhadores projetados para se adaptarem à sua rotina com conforto e discrição."
    ]
  },
  { 
    id: "clareamento", 
    label: "Clareamento Dental", 
    categoryTitle: "CLAREAMENTO DENTAL",
    topCaptions: [
      "O brilho que faltava no seu sorriso.",
      "Ilumine seu sorriso de forma segura e duradoura",
      "Sorriso renovado, radiante e natural"
    ],
    postCaptions: [
      "O clareamento dental supervisionado garante um resultado brilhante sem agredir a estrutura do esmalte.",
      "Um sorriso mais claro renova a autoestima e ilumina a sua expressão."
    ]
  },
  { 
    id: "extracao", 
    label: "Cirurgia / Extração", 
    categoryTitle: "CIRURGIA ORANIZADA",
    topCaptions: [
      "Procedimento seguro, indolor e humanizado.",
      "Cuidado, precisão e conforto do início ao fim",
      "Sua saúde bucal em primeiro lugar"
    ],
    postCaptions: [
      "Realizar procedimentos cirúrgicos com técnicas minimamente invasivas garante um pós-operatório tranquilo.",
      "Sua segurança e bem-estar são prioridade máxima."
    ]
  },
  { 
    id: "resina", 
    label: "Resina Composta / Restauração", 
    categoryTitle: "RESINAS COMPOSTAS",
    topCaptions: [
      "Volte a sorrir com excelência.",
      "Estética e naturalidade em cada detalhe",
      "Esculpindo sorrisos com precisão artesanal"
    ],
    postCaptions: [
      "A resina composta permite restaurações biomecanicamente compatíveis e visualmente imperceptíveis.",
      "Devolver a anatomia original do dente preservando a estrutura saudável."
    ]
  },
  { 
    id: "implante", 
    label: "Implantes Dentários", 
    categoryTitle: "IMPLANTES DENTÁRIOS",
    topCaptions: [
      "Recupere sua autoestima e a função mastigatória.",
      "A solução definitiva para dentes perdidos",
      "Sorria e mastigue com total segurança"
    ],
    postCaptions: [
      "Os implantes dentários oferecem estabilidade, conforto e aparência idêntica aos dentes naturais.",
      "Reabilitação oral completa com planejamento guiado por computador."
    ]
  }
];

export const FORMAT_OPTIONS = [
  { id: "feed-square", label: "Feed Quadrado (1:1)", width: 1080, height: 1080, ratio: "1 / 1" },
  { id: "feed-portrait", label: "Feed Retrato (4:5)", width: 1080, height: 1350, ratio: "4 / 5" },
  { id: "story", label: "Story / Reels (9:16)", width: 1080, height: 1920, ratio: "9 / 16" }
];