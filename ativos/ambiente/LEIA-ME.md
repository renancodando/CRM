# Camadas do cenário

`observatorio.webp` contém apenas o relevo, a cúpula e a plataforma decorativa, sem textos, botões, números ou painéis. O arquivo é aplicado a uma malha com profundidade; o shader movimenta a superfície da água sem deslocar as rochas. Os marcadores das empresas são objetos independentes.

`piso.webp` fornece os materiais e as reflexões ambientais do primeiro plano. A água é renderizada pelo shader de `ambiente/agua.js`, que calcula o relevo, as normais, a refração, as perturbações de mouse e toque e os reflexos dos objetos da cena.

A ampulheta, seus grãos, o objeto do Foco da Semana, o gráfico, os textos, os indicadores e todos os controles continuam implementados em componentes separados. Os arquivos desta pasta não contêm uma captura de interface.
