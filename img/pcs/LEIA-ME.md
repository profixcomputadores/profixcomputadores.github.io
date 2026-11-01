# Fotos reais dos PCs montados pela ProFix

Coloque aqui de 3 a 6 fotos de PCs que o Pedro montou de verdade (nada de banco de imagens).

| Arquivo | Onde aparece |
|---|---|
| `pc1.webp` | card **Linha Basic & Home Office** + galeria |
| `pc2.webp` | card **Linha Corporativa & Pro** + galeria |
| `pc3.webp` | card **Linha Gamer & Render** + galeria |
| `pc4.webp` a `pc6.webp` | só galeria (opcionais) |

Formato: webp, proporção 4:3 (ex.: 1200×900), até ~120 KB cada. Exemplo de conversão:
`python3 -c "from PIL import Image,ImageOps; im=ImageOps.exif_transpose(Image.open('foto.jpg')).convert('RGB'); im=ImageOps.fit(im,(1200,900)); im.save('pc1.webp',quality=78)"`

Depois de copiar o arquivo, ligue a foto no `config.js`:
```js
FOTOS_PCS: {
  pc1: { arquivo: 'pc1.webp', alt: 'PC Home Office montado pela ProFix' },
  pc3: { arquivo: 'pc3.webp', alt: 'PC Gamer com RGB montado pela ProFix' }
}
```
Foto que não estiver listada (ou não existir) continua com o placeholder. Sem valores nas legendas.
