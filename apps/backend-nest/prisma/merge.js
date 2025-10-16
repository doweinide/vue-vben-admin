/**
 * Prisma Schema 合并脚本
 *
 * 此脚本用于将 prisma/schemas 目录下的多个 .prisma 文件合并为单个 schema.prisma 文件
 *
 * 功能特性：
 * - 自动读取 schemas 目录下的所有 .prisma 文件
 * - 按照正确的顺序合并（generator 和 datasource 在前，model 在后）
 * - 去除重复的文件头注释
 * - 保持代码格式和注释
 * - 生成最终的 schema.prisma 文件
 *
 * 使用方法：
 * npm run prisma:merge
 *
 * 作者：Vben Admin Team
 * 创建时间：2024
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * 合并配置
 */
const CONFIG = {
  // schemas 目录路径
  schemasDir: path.join(__dirname, 'schemas'),
  // 输出文件路径
  outputFile: path.join(__dirname, 'schema.prisma'),
  // 文件编码
  encoding: 'utf8',
};

/**
 * 日志输出函数
 * @param {string} message - 日志消息
 * @param {string} type - 日志类型 (info, success, error, warn)
 */
function log(message, type = 'info') {
  const colors = {
    info: '\u001B[36m', // 青色
    success: '\u001B[32m', // 绿色
    error: '\u001B[31m', // 红色
    warn: '\u001B[33m', // 黄色
    reset: '\u001B[0m', // 重置
  };

  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * 检查目录是否存在
 * @param {string} dirPath - 目录路径
 * @returns {boolean} 目录是否存在
 */
function checkDirectory(dirPath) {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 读取目录下的所有 .prismaFeg 文件
 * @param {string} dirPath - 目录路径
 * @returns {string[]} .prisma 文件名数组
 */
function getPrismaFiles(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.filter((file) => file.endsWith('.prismaFeg')).sort();
  } catch (error) {
    log(`读取目录失败: ${error.message}`, 'error');
    return [];
  }
}

/**
 * 读取文件内容
 * @param {string} filePath - 文件路径
 * @returns {string} 文件内容
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, CONFIG.encoding);
  } catch (error) {
    log(`读取文件失败 ${filePath}: ${error.message}`, 'error');
    return '';
  }
}

/**
 * 解析 Prisma 文件内容
 * @param {string} content - 文件内容
 * @param {string} fileName - 文件名
 * @returns {object} 解析后的内容对象
 */
function parseContent(content, fileName) {
  const lines = content.split('\n');
  const result = {
    header: [],
    generators: [],
    datasources: [],
    models: [],
    enums: [],
    others: [],
  };

  let currentSection = 'header';
  let currentBlock = [];
  let inBlock = false;
  let pendingComments = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 如果在块内
    if (inBlock) {
      currentBlock.push(line);

      // 检测块结束
      if (trimmedLine === '}') {
        inBlock = false;
        result[currentSection].push(currentBlock.join('\n'));
        currentBlock = [];
        pendingComments = [];
      }
    } else {
      // 检测注释和空行
      if (
        trimmedLine === '' ||
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('/*') ||
        trimmedLine.startsWith('*') ||
        trimmedLine.endsWith('*/')
      ) {
        if (currentSection === 'header') {
          result.header.push(line);
        } else {
          pendingComments.push(line);
        }
        continue;
      }

      // 检测块开始
      if (trimmedLine.startsWith('generator ')) {
        currentSection = 'generators';
        inBlock = true;
        currentBlock = [...pendingComments, line];
        pendingComments = [];
      } else if (trimmedLine.startsWith('datasource ')) {
        currentSection = 'datasources';
        inBlock = true;
        currentBlock = [...pendingComments, line];
        pendingComments = [];
      } else if (trimmedLine.startsWith('model ')) {
        currentSection = 'models';
        inBlock = true;
        currentBlock = [...pendingComments, line];
        pendingComments = [];
      } else if (trimmedLine.startsWith('enum ')) {
        currentSection = 'enums';
        inBlock = true;
        currentBlock = [...pendingComments, line];
        pendingComments = [];
      } else {
        result.others.push(line);
      }
    }
  }

  return result;
}

/**
 * 合并所有内容
 * @param {object[]} parsedContents - 解析后的内容数组
 * @returns {string} 合并后的内容
 */
function mergeContents(parsedContents) {
  const merged = {
    generators: [],
    datasources: [],
    models: [],
    enums: [],
    others: [],
  };

  // 合并所有解析的内容
  parsedContents.forEach((content) => {
    merged.generators.push(...content.generators);
    merged.datasources.push(...content.datasources);
    merged.models.push(...content.models);
    merged.enums.push(...content.enums);
    merged.others.push(...content.others);
  });

  // 构建最终内容
  const result = [];

  // 添加文件头注释
  result.push(
    '/**',
    ' * Prisma 数据库模式定义文件',
    ' * ',
    ' * 此文件由 merge.js 脚本自动生成，请勿手动编辑',
    ' * 如需修改，请编辑 prisma/schemas 目录下的对应文件',
    ' * ',
  );
  result.push(
    ` * 生成时间: ${new Date().toLocaleString()}`,
    ' * ',
    ' * 更多信息请参考: https://pris.ly/d/prisma-schema',
    ' */',
    '',
  );

  // 添加 generators
  if (merged.generators.length > 0) {
    merged.generators.forEach((generator) => {
      result.push(generator, '');
    });
  }

  // 添加 datasources
  if (merged.datasources.length > 0) {
    merged.datasources.forEach((datasource) => {
      result.push(datasource, '');
    });
  }

  // 添加 enums
  if (merged.enums.length > 0) {
    merged.enums.forEach((enumDef) => {
      result.push(enumDef, '');
    });
  }

  // 添加 models
  if (merged.models.length > 0) {
    merged.models.forEach((model) => {
      result.push(model, '');
    });
  }

  // 添加其他内容
  if (merged.others.length > 0) {
    merged.others.forEach((other) => {
      if (other.trim()) {
        result.push(other);
      }
    });
  }

  return `${result.join('\n').trim()}\n`;
}

/**
 * 写入文件
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, CONFIG.encoding);
    log(`成功写入文件: ${filePath}`, 'success');
  } catch (error) {
    log(`写入文件失败 ${filePath}: ${error.message}`, 'error');
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  log('开始合并 Prisma Schema 文件...', 'info');

  // 检查 schemas 目录是否存在
  if (!checkDirectory(CONFIG.schemasDir)) {
    log(`schemas 目录不存在: ${CONFIG.schemasDir}`, 'error');
    log('请先创建 schemas 目录并添加 .prisma 文件', 'warn');
    process.exit(1);
  }

  // 获取所有 .prisma 文件
  const prismaFiles = getPrismaFiles(CONFIG.schemasDir);

  if (prismaFiles.length === 0) {
    log('未找到任何 .prisma 文件', 'warn');
    process.exit(1);
  }

  log(
    `找到 ${prismaFiles.length} 个 .prisma 文件: ${prismaFiles.join(', ')}`,
    'info',
  );

  // 读取并解析所有文件
  const parsedContents = [];

  for (const fileName of prismaFiles) {
    const filePath = path.join(CONFIG.schemasDir, fileName);
    log(`正在处理文件: ${fileName}`, 'info');

    const content = readFile(filePath);
    if (content) {
      const parsed = parseContent(content, fileName);
      parsedContents.push(parsed);
    }
  }

  if (parsedContents.length === 0) {
    log('没有成功解析任何文件', 'error');
    process.exit(1);
  }

  // 合并内容
  log('正在合并文件内容...', 'info');
  const mergedContent = mergeContents(parsedContents);

  // 写入输出文件
  writeFile(CONFIG.outputFile, mergedContent);

  log('Schema 文件合并完成！', 'success');
  log(`输出文件: ${CONFIG.outputFile}`, 'info');
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  main,
  CONFIG,
};
