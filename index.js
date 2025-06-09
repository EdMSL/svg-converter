// Если запускать из папки проекта, то выполняем "node ./index.js путь_к_папке"
// Чтобы выполнить скрипт  сразу из папки с файлами, то выполняем прсто "convertsvg"
import { vectorize, ColorMode, Hierarchical, PathSimplifyMode, Preset } from '@neplex/vectorizer';
import {trace} from 'potrace';
import { readFile, writeFile } from 'node:fs/promises';
import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';

const destPath = path.resolve(process.argv[2] || "./");
const convertFolderPath = path.join(destPath, "svg");

if (!fs.existsSync(convertFolderPath)) {
  fs.mkdirSync(convertFolderPath)
}

const convertFile = file => {
  return new Promise((resolve, reject) => {
    trace(file, (err, svg) => {
      if (err) reject(err)
      resolve(svg)
    })
  })
}

fs.readdirSync(destPath).forEach(async (file, index) => {
  const pathToFile = path.join(destPath, file);

  if (fs.lstatSync(pathToFile).isFile()) {
    // Вариант 1
    // const src = await readFile(pathToFile);
    // const svg = await vectorize(src, {
    //   colorMode: ColorMode.Color,
    //   colorPrecision: 6,
    //   filterSpeckle: 4,
    //   spliceThreshold: 45,
    //   cornerThreshold: 40,
    //   hierarchical: Hierarchical.Stacked,
    //   mode: PathSimplifyMode.Spline,
    //   layerDifference: 5,
    //   lengthThreshold: 5,
    //   maxIterations: 2,
    //   pathPrecision: 5,
    // });

    // Вариант 2
    const svg = await convertFile(pathToFile);

    const result = optimize(svg);
  
    await writeFile(`${path.resolve(convertFolderPath, path.basename(file, 'png'))}svg`, result.data);
  }
})