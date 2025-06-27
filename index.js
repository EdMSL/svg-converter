// Если запускать из папки проекта, то выполняем "node ./index.js путь_к_папке"
// Чтобы выполнить скрипт  сразу из папки с файлами, то выполняем прсто "convertsvg"
import * as vectorizer from '@neplex/vectorizer';
import { trace } from 'potrace';
import { readFile, writeFile } from 'node:fs/promises';
import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';

const destPath = path.resolve(process.argv[2] || "./");

const convertFile = file => {
  return new Promise((resolve, reject) => {
    trace(file, (err, svg) => {
      if (err) reject(err)
      resolve(svg)
    })
  })
}

const convertFiles = (pathTo) => {
  fs.readdirSync(pathTo).forEach(async (file, index) => {
    const pathToFile = path.join(pathTo, file);
    const convertFolderPath = path.join(pathTo, "svg");

    if (fs.lstatSync(pathToFile).isFile() && path.extname(pathToFile) === '.png') {
      // Вариант 1. Для цветных изображений.
      const svg = await vectorizer.vectorize(await readFile(pathToFile), {
        colorMode: vectorizer.ColorMode.Color,
        colorPrecision: 6,
        filterSpeckle: 4,
        spliceThreshold: 35,
        cornerThreshold: 40,
        hierarchical: vectorizer.Hierarchical.Stacked,
        mode: vectorizer.PathSimplifyMode.Spline,
        layerDifference: 5,
        lengthThreshold: 5,
        maxIterations: 10,
        pathPrecision: 8,
      });

      // Вариант 2. Для ч\б изображений.
      // const svg = await convertFile(pathToFile);

      // Процесс обработки.
      const result = optimize(svg);

      if (result.data && !fs.existsSync(convertFolderPath)) {
        fs.mkdirSync(convertFolderPath)
      }

      await writeFile(`${path.resolve(convertFolderPath, path.basename(file, 'png'))}svg`, result.data);
    } else if (fs.lstatSync(pathToFile).isDirectory() && path.basename(pathToFile) !== 'svg') {
      convertFiles(pathToFile);
    }
  })
}

convertFiles(destPath);