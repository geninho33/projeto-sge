/** Mock data store — substituído por GeneXus REST quando disponível */

const store = {
  bairros: [
    { id: 1, baiCodigo: 1, baiNome: "Centro", baiStatus: "A" },
    { id: 2, baiCodigo: 2, baiNome: "Trindade", baiStatus: "A" },
    { id: 3, baiCodigo: 3, baiNome: "Coqueiros", baiStatus: "A" },
  ],
  ruas: [
    { id: 1, ruaCodigo: 1, ruaNome: "Rua Felipe Schmidt", baiNome: "Centro", ruaStatus: "A" },
    { id: 2, ruaCodigo: 2, ruaNome: "Av. Beira Mar Norte", baiNome: "Coqueiros", ruaStatus: "A" },
  ],
  estados: [
    { id: 1, estCodigo: "SC", estNome: "Santa Catarina", estStatus: "A" },
    { id: 2, estCodigo: "PR", estNome: "Paraná", estStatus: "A" },
    { id: 3, estCodigo: "RS", estNome: "Rio Grande do Sul", estStatus: "A" },
  ],
  paises: [
    { id: 1, paiCodigo: 1, paiNome: "Brasil", paiStatus: "A" },
    { id: 2, paiCodigo: 2, paiNome: "Argentina", paiStatus: "A" },
  ],
  municipios: [
    { id: 1, munCodigo: 4205407, munNome: "Florianópolis", estNome: "SC", munStatus: "A" },
    { id: 2, munCodigo: 4209102, munNome: "Joinville", estNome: "SC", munStatus: "A" },
  ],
  disciplinas: [
    { id: 1, disCodigo: 1, disNome: "Língua Portuguesa", disStatus: "A" },
    { id: 2, disCodigo: 2, disNome: "Matemática", disStatus: "A" },
  ],
  cursos: [
    { id: 1, curCodigo: 1, curNome: "Ensino Fundamental", curStatus: "A" },
    { id: 2, curCodigo: 2, curNome: "Ensino Médio", curStatus: "A" },
  ],
  entidades: [
    { id: 1, entCodigo: 1, entNome: "Secretaria Municipal de Educação", entStatus: "A" },
  ],
  unidadesEscolares: [
    { id: 1, ueCodigo: 8105, ueNome: "EMEF FLORIANOPOLIS", ueStatus: "A", munNome: "Florianópolis" },
    { id: 2, ueCodigo: 8106, ueNome: "EMEF CENTRO", ueStatus: "A", munNome: "Florianópolis" },
  ],
  motivosDesistencia: [
    { id: 1, motCodigo: 1, motDescricao: "Mudança de cidade", motStatus: "A" },
  ],
  listaEsperaInfantil: [
    { id: 1, aluCodigo: 1001, aluNome: "Maria Silva", aluNascimento: "2022-03-15", listaStatus: "A" },
  ],
  grupoTurmaLE: [
    { id: 1, gruCodigo: 1, gruDescricao: "Grupo A - Manhã", gruStatus: "A" },
  ],
  listaEsperaProjetos: [
    { id: 1, aluCodigo: 2001, aluNome: "João Santos", projetoNome: "Projeto Bilíngue", listaStatus: "A" },
  ],
  motivosAusencia: [
    { id: 1, motCodigo: 1, motDescricao: "Doença", motStatus: "A" },
  ],
  tiposAvaliacao: [
    { id: 1, tipCodigo: 1, tipDescricao: "Prova escrita", tipStatus: "A" },
  ],
  frequencia: [
    { id: 1, turCodigo: 101, turNome: "1º Ano A", freqMes: "2026-03", freqPercentual: 92.5 },
  ],
};

export function getCollection(name) {
  return store[name] || [];
}

export function getContext() {
  return { ano: "2026", ue: "8105" };
}
