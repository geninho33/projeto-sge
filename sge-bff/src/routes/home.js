import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    data: {
      titulo: "IntelliBR Gestão Educacional",
      versao: "6.0.0",
      usuario: "IntelliBR Sistemas",
      ano: "2026",
      ue: "8105",
      modulos: [
        { id: "secretaria", label: "Secretaria Educação", telas: 24 },
        { id: "matricula", label: "Matrícula On-Line", telas: 18 },
        { id: "parametrizacao", label: "Parametrização", telas: 32 },
        { id: "lista-espera", label: "Lista Espera Infantil", telas: 14 },
      ],
      atalhos: [
        { codigo: "SGE-007", label: "Mudar Ano/UE" },
        { codigo: "SGE-004", label: "Unidades Escolares" },
        { codigo: "SGE-108", label: "Bairros" },
      ],
    },
  });
});

export default router;
