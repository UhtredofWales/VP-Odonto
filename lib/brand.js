export const BRAND = {
  name: "Vitor H. Parra",
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
      "As lentes de contato dentais devolvem a simetria, a cor e a confiança do seu sorriso.",
      "Transformação concluída com sucesso! Cada detalhe planejado digitalmente."
    ],
    ctaButtons: ["Agende sua avaliação", "Saiba mais sobre nossas técnicas"]
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
      "Alinhar seus dentes vai muito além da estética: melhora a mastigação e a sua qualidade de vida.",
      "Conforto, precisão e eficiência em cada tratamento."
    ],
    ctaButtons: ["Agende sua avaliação", "Saiba mais sobre nossas técnicas"]
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
      "O clareamento dental supervisionado garante um resultado brilhante sem agredir o esmalte.",
      "Um sorriso mais claro renova a autoestima e ilumina a sua expressão."
    ],
    ctaButtons: ["Agende sua avaliação", "Quero clarear meu sorriso"]
  },
  { 
    id: "extracao", 
    label: "Cirurgia / Extração", 
    categoryTitle: "CIRURGIA ORAL",
    topCaptions: [
      "Procedimento seguro, indolor e humanizado.",
      "Cuidado, precisão e conforto do início ao fim",
      "Sua saúde bucal em primeiro lugar"
    ],
    postCaptions: [
      "Realizar procedimentos cirúrgicos com técnicas minimamente invasivas garante um pós-tranquilo.",
      "Sua segurança e bem-estar são prioridade máxima."
    ],
    ctaButtons: ["Agende sua avaliação", "Fale com nossa equipe"]
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
      "Naturalidade • Harmonia • Qualidade",
      "Um novo sorriso começa com cuidado e precisão."
    ],
    ctaButtons: ["Agende sua avaliação", "Conheça nossas restaurações"]
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
      "Os implantes dentários oferecem estabilidade e aparência idêntica aos dentes naturais.",
      "Reabilitação oral completa com planejamento guiado."
    ],
    ctaButtons: ["Agende sua avaliação", "Recupere seu sorriso"]
  }
];

export const FORMAT_OPTIONS = [
  { id: "feed-square", label: "Feed Quadrado (1:1)", width: 1080, height: 1080, ratio: "1 / 1" },
  { id: "feed-portrait", label: "Feed Retrato (4:5)", width: 1080, height: 1350, ratio: "4 / 5" },
  { id: "story", label: "Story / Reels (9:16)", width: 1080, height: 1920, ratio: "9 / 16" }
];