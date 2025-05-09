import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';

function walk(dir: string, filelist: string[] = []): string[] {
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (file.endsWith('.html')) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function getTitle(htmlPath: string): string {
  const content = fs.readFileSync(htmlPath, 'utf-8');
  const match = content.match(/<title>(.*?)<\/title>/i);
  return match ? match[1] : path.basename(htmlPath);
}

async function generateHtml() {
  const pagesDir = path.resolve(process.cwd(), 'src/pages');
  const outDir = path.resolve(process.cwd());

  console.log('outDir', outDir);

  const indexPath = path.resolve(process.cwd(), 'index.template.html');
  if (!fs.existsSync(pagesDir) || !fs.existsSync(indexPath)) return;
  // Генерируем список ссылок
  const files = walk(pagesDir);
  const links = files
    .map((f) => {
      const rel = path.relative(pagesDir, f).replace(/\\/g, '/');
      const title = getTitle(f);
      return `<a href="/src/pages/${rel}" target="content-frame" class="line-clamp-1" title="${title}">${title}</a>`;
    })
    .join('\n');
  // Вставляем ссылки в index.html
  let indexHtml = fs.readFileSync(indexPath, 'utf-8');
  indexHtml = indexHtml.replace(
    /<div class="contents" id="page-links">[\s\S]*?<\/div>/,
    `
          <div class="contents" id="page-links">
            ${links}
          </div>
    `
  );

  console.log('links', links);
  console.log('output', path.join(outDir, 'index.html'));

  fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
}

export default function generateHtmlPlugin(): Plugin {
  return {
    name: 'generate-html',
    async buildStart() {
      await generateHtml();
    },
    async watchChange() {
      await generateHtml();
    },
  };
}
