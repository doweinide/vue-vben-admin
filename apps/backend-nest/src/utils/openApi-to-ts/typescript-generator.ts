import type {
  FileTreeNode,
  GeneratedFile,
  GenerateOptions,
  GenerateResult,
  GeneratorConfig,
  OpenAPIDocument,
  OperationObject,
  ParameterObject,
  SchemaObject,
} from './types/openapi';

// TypeScript 代码生成器
import { filterByTags } from './openapi-parser';

/**
 * 生成代码（兼容旧接口）
 * @param options 生成选项
 * @returns 生成结果
 */
export function generateCode(options: GenerateOptions): GenerateResult {
  return generateTypeScriptCode(options.openApiDoc, options.config);
}

/**
 * 生成 TypeScript 代码
 * @param openApiDoc OpenAPI 文档
 * @param config 生成配置
 * @param apiPrefix 全局 API 前缀，用于从函数名中移除
 * @returns 生成结果
 */
export function generateTypeScriptCode(
  openApiDoc: OpenAPIDocument,
  config?: Partial<GeneratorConfig>,
  apiPrefix?: string,
): GenerateResult {
  const mergedConfig: GeneratorConfig = {
    functionNaming: 'camelCase',
    generateIndex: true,
    generateUtils: true,
    importTemplate: "import { request } from '../utils/request';",
    includeComments: true,
    outputTags: [],
    separateTypes: true,
    createByTags: false,
    typeNaming: 'PascalCase',
    useAsync: true,
    ...config,
  };

  // 根据配置过滤文档
  const filteredDoc =
    mergedConfig.outputTags.length > 0
      ? filterByTags(openApiDoc, mergedConfig.outputTags)
      : openApiDoc;

  const files: GeneratedFile[] = [];
  const generator = new TypeScriptGenerator(
    filteredDoc,
    mergedConfig,
    apiPrefix,
  );

  // 生成类型文件
  if (mergedConfig.separateTypes) {
    files.push(generator.generateTypesFile());
  }

  // 生成工具文件
  if (mergedConfig.generateUtils) {
    files.push(generator.generateUtilsFile());
  }

  // 按标签生成 API 文件
  const apiFiles = generator.generateApiFiles();
  files.push(...apiFiles);

  // 生成索引文件
  if (mergedConfig.generateIndex) {
    files.push(generator.generateIndexFile(apiFiles));
  }

  return {
    files,
    structure: generateFileStructure(files),
  };
}

/**
 * TypeScript 代码生成器类
 */
class TypeScriptGenerator {
  private apiPrefix: string;
  private config: GeneratorConfig;
  private doc: OpenAPIDocument;

  constructor(
    doc: OpenAPIDocument,
    config: GeneratorConfig,
    apiPrefix?: string,
  ) {
    this.doc = doc;
    this.config = config;
    this.apiPrefix = apiPrefix || 'api';
  }

  /**
   * 生成 API 文件
   */
  generateApiFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const tagGroups = this.groupOperationsByTag();

    if (this.config.createByTags) {
      // 根据 tags 分文件生成
      Object.entries(tagGroups).forEach(([tag, operations]) => {
        const shouldGenerate =
          this.config.outputTags.length === 0 ||
          this.config.outputTags.includes(tag) ||
          tag === 'default';

        if (!shouldGenerate) {
          return;
        }

        const content = this.generateApiFileContent(tag, operations);
        const fileName = this.formatFileName(tag);

        files.push({
          content,
          filename: `${fileName}.ts`,
          path: `${fileName}.ts`,
          type: 'typescript',
        });
      });
    } else {
      // 传统的单文件模式，将所有 API 合并到一个文件中
      const allOperations: Array<{
        method: string;
        operation: OperationObject;
        path: string;
      }> = [];

      Object.entries(tagGroups).forEach(([tag, operations]) => {
        const shouldGenerate =
          this.config.outputTags.length === 0 ||
          this.config.outputTags.includes(tag) ||
          tag === 'default';

        if (shouldGenerate) {
          allOperations.push(...operations);
        }
      });

      if (allOperations.length > 0) {
        const content = this.generateApiFileContent('api', allOperations);
        files.push({
          content,
          filename: 'api.ts',
          path: 'api.ts',
          type: 'typescript',
        });
      }
    }

    return files;
  }

  /**
   * 生成索引文件
   */
  generateIndexFile(apiFiles: GeneratedFile[]): GeneratedFile {
    const exports: string[] = [];

    if (this.config.includeComments) {
      exports.push('// 统一导出文件\n');
    }

    // 导出类型
    if (this.config.separateTypes) {
      exports.push('export * from "./types";');
    }

    // 导出工具
    if (this.config.generateUtils) {
      exports.push('export * from "./utils/request";');
    }

    // 导出 API 文件
    apiFiles.forEach((file) => {
      const fileName = file.path.replace('.ts', '');
      exports.push(`export * from "./${fileName}";`);
    });

    return {
      content: exports.join('\n'),
      filename: 'index.ts',
      path: 'index.ts',
      type: 'typescript',
    };
  }

  /**
   * 生成类型文件
   */
  generateTypesFile(): GeneratedFile {
    const types: string[] = [];

    // 添加文件头注释
    if (this.config.includeComments) {
      types.push('// 自动生成的类型定义文件');
      types.push('// 请勿手动修改此文件\n');
    }

    // 生成 Schema 类型
    if (this.doc.components?.schemas) {
      Object.entries(this.doc.components.schemas).forEach(([name, schema]) => {
        types.push(this.generateSchemaType(name, schema));
      });
    }

    // 生成请求和响应类型
    const operationTypes = this.generateOperationTypes();
    types.push(...operationTypes);

    return {
      content: types.join('\n'),
      filename: 'types.ts',
      path: 'types.ts',
      type: 'typescript',
    };
  }

  /**
   * 生成工具文件
   */
  generateUtilsFile(): GeneratedFile {
    const utils: string[] = [];

    if (this.config.includeComments) {
      utils.push('// HTTP 请求工具');
      utils.push('// 请根据项目需要修改此文件\n');
    }

    // 基础请求接口
    utils.push('export interface RequestConfig {');
    utils.push('  url: string;');
    utils.push('  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";');
    utils.push('  params?: Record<string, any>;');
    utils.push('  data?: any;');
    utils.push('  headers?: Record<string, string>;');
    utils.push('}\n');

    // 请求函数模板
    utils.push(
      'export async function request<T = any>(config: RequestConfig): Promise<T> {',
    );
    utils.push('  // TODO: 实现具体的请求逻辑');
    utils.push('  // 这里需要根据项目使用的 HTTP 客户端进行实现');
    utils.push('  throw new Error("请实现 request 函数");');
    utils.push('}');

    return {
      content: utils.join('\n'),
      filename: 'request.ts',
      path: 'utils/request.ts',
      type: 'typescript',
    };
  }

  /**
   * 构建请求配置
   */
  private buildRequestConfig(
    path: string,
    method: string,
    operation: OperationObject,
  ): { data?: string; params?: string } {
    const config: { data?: string; params?: string } = {};

    // 处理查询参数
    const queryParams = operation.parameters?.filter((p) => p.in === 'query');
    if (queryParams?.length) {
      config.params = 'params';
    }

    // 处理请求体
    if (operation.requestBody && ['patch', 'post', 'put'].includes(method)) {
      config.data = 'params.body';
    }

    return config;
  }

  /**
   * 格式化文件名称
   */
  private formatFileName(name: string): string {
    // 尝试从 OpenAPI 文档的 tags 中查找英文副名
    const englishName = this.getTagEnglishName(name);
    if (englishName) {
      return englishName;
    }

    // 如果是中文标签，直接使用中文名称
    if (/[\u4E00-\u9FA5]/.test(name)) {
      return name;
    }

    // 对于英文标签，进行格式化处理
    return (
      name
        .toLowerCase()
        .replaceAll(/[^a-z0-9]/g, '-')
        .replaceAll(/-+/g, '-')
        .replaceAll(/^-|-$/g, '') || 'api'
    );
  }

  /**
   * 格式化函数名称
   */
  private formatFunctionName(name: string): string {
    const formatted = name.replaceAll(/[^a-z0-9]/gi, '_');
    return this.config.functionNaming === 'camelCase'
      ? this.toCamelCase(formatted)
      : this.toSnakeCase(formatted);
  }

  /**
   * 格式化类型名称
   */
  private formatTypeName(name: string): string {
    const formatted = name.replaceAll(/[^a-z0-9]/gi, '_');
    if (this.config.typeNaming === 'PascalCase') {
      return this.toPascalCase(formatted);
    } else if (this.config.typeNaming === 'snake_case') {
      return this.toSnakeCase(formatted);
    } else {
      return this.toCamelCase(formatted);
    }
  }

  /**
   * 生成 API 文件内容
   */
  private generateApiFileContent(
    tag: string,
    operations: Array<{
      method: string;
      operation: OperationObject;
      path: string;
    }>,
  ): string {
    const content: string[] = [];
    const usedTypes = new Set<string>();

    // 添加导入语句
    content.push(this.config.importTemplate);

    // 收集该文件中使用的类型
    if (this.config.separateTypes) {
      operations.forEach(({ method, operation, path }) => {
        const functionName = this.generateFunctionNameFromPath(path, method);

        // 收集请求类型
        if (operation.parameters?.length || operation.requestBody) {
          usedTypes.add(this.formatTypeName(`${functionName}Request`));
        }

        // 收集响应类型
        usedTypes.add(this.formatTypeName(`${functionName}Response`));
      });

      if (usedTypes.size > 0) {
        const typesList = [...usedTypes].sort().join(', ');
        content.push(`import type { ${typesList} } from './types';`);
      }
    }

    content.push('');

    // 如果不分离类型文件，生成相关的类型定义
    if (!this.config.separateTypes) {
      const typeDefinitions: string[] = [];

      operations.forEach(({ method, operation, path }) => {
        const operationTypes = this.generateOperationTypeDefinitions(
          path,
          method,
          operation,
        );
        typeDefinitions.push(...operationTypes);
      });

      if (typeDefinitions.length > 0) {
        if (this.config.includeComments) {
          content.push('// ============== 类型定义 ==============');
          content.push('');
        }
        content.push(...typeDefinitions);
        content.push('');
        if (this.config.includeComments) {
          content.push('// ============== API 函数 ==============');
          content.push('');
        }
      }
    }

    // 生成函数
    operations.forEach(({ method, operation, path }) => {
      const functionCode = this.generateApiFunction(path, method, operation);
      content.push(functionCode);
      content.push('');
    });

    return content.join('\n');
  }

  /**
   * 生成 API 函数
   */
  private generateApiFunction(
    path: string,
    method: string,
    operation: OperationObject,
  ): string {
    const functionName = this.generateFunctionNameFromPath(path, method);

    // 构建参数
    const hasParams = operation.parameters?.length || operation.requestBody;
    const paramType = hasParams
      ? `params: ${this.formatTypeName(`${functionName}Request`)}`
      : '';

    // 构建返回类型
    const baseResponseType = this.formatTypeName(`${functionName}Response`);
    const responseType = this.config.responseDataKey
      ? `${baseResponseType}['${this.config.responseDataKey}']`
      : baseResponseType;
    const returnType = `Promise<${responseType}>`;

    // 构建函数签名
    const signature = `export const ${functionName} = async (${paramType}): ${returnType} => {`;

    const lines: string[] = [];

    // 添加注释
    if (this.config.includeComments) {
      lines.push('/**');
      lines.push(` * ${operation.summary || functionName}`);
      if (operation.description) {
        lines.push(` * ${operation.description}`);
      }
      lines.push(' */');
    }

    lines.push(signature);

    // 构建请求配置
    const requestConfig = this.buildRequestConfig(path, method, operation);

    // 处理路径参数，将 {id} 转换为 ${params.id}
    const processedUrl = this.processPathParameters(path, operation);

    lines.push(`  const response = await request<${responseType}>({`);
    lines.push(`    url: ${processedUrl},`);
    lines.push(`    method: '${method.toUpperCase()}',`);

    if (requestConfig.params) {
      lines.push(`    params: ${requestConfig.params},`);
    }

    if (requestConfig.data) {
      lines.push(`    data: ${requestConfig.data},`);
    }

    lines.push('  });');
    lines.push('  return response;');
    lines.push('};');

    return lines.join('\n');
  }

  /**
   * 基于完整路径生成函数名
   */
  private generateFunctionNameFromPath(path: string, method: string): string {
    // 动态移除路径开头的全局 API 前缀
    let cleanPath = path;
    const prefixToRemove = `/${this.apiPrefix}`;

    if (cleanPath.startsWith(`${prefixToRemove}/`)) {
      cleanPath = cleanPath.slice(prefixToRemove.length); // 移除前缀
    } else if (cleanPath === prefixToRemove) {
      cleanPath = '/'; // 如果路径就是前缀本身，则设为根路径
    }

    const pathParts = cleanPath
      .replace(/^\//, '')
      .split('/')
      .filter(Boolean)
      .map((part) => {
        // 如果是路径参数，提取参数名并转换为驼峰命名
        if (part.startsWith('{') && part.endsWith('}')) {
          const paramName = part.slice(1, -1); // 移除 { 和 }
          return this.toCamelCase(paramName);
        }
        return part;
      });

    const fullName = `${method}_${pathParts.join('_')}`;
    return this.formatFunctionName(fullName);
  }

  /**
   * 生成操作类型定义
   */
  private generateOperationTypeDefinitions(
    path: string,
    method: string,
    operation: OperationObject,
  ): string[] {
    const types: string[] = [];
    const functionName = this.generateFunctionNameFromPath(path, method);

    // 生成请求参数类型
    const requestType = this.generateRequestType(functionName, operation);
    if (requestType) {
      types.push(requestType);
    }

    // 生成响应类型
    const responseTypes = this.generateResponseTypes(functionName, operation);
    types.push(...responseTypes);

    return types;
  }

  /**
   * 生成操作类型
   */
  private generateOperationTypes(): string[] {
    const types: string[] = [];

    Object.entries(this.doc.paths).forEach(([path, pathItem]) => {
      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;

      methods.forEach((method) => {
        const operation = pathItem[method];
        if (operation) {
          const operationTypes = this.generateOperationTypeDefinitions(
            path,
            method,
            operation,
          );
          types.push(...operationTypes);
        }
      });
    });

    return types;
  }

  /**
   * 生成请求类型
   */
  private generateRequestType(
    functionName: string,
    operation: OperationObject,
  ): null | string {
    const params: string[] = [];

    // 处理参数
    if (operation.parameters) {
      operation.parameters.forEach((param) => {
        if (param.in === 'query' || param.in === 'path') {
          const paramType = this.parameterToTypeScript(param);
          params.push(
            `  ${param.name}${param.required ? '' : '?'}: ${paramType};`,
          );
        }
      });
    }

    // 处理请求体
    if (operation.requestBody) {
      const bodyType = this.requestBodyToTypeScript(operation.requestBody);
      params.push(`  body: ${bodyType};`);
    }

    if (params.length === 0) {
      return null;
    }

    const typeName = this.formatTypeName(`${functionName}Request`);
    return `export interface ${typeName} {\n${params.join('\n')}\n}`;
  }

  /**
   * 生成响应类型
   */
  private generateResponseTypes(
    functionName: string,
    operation: OperationObject,
  ): string[] {
    const types: string[] = [];
    const typeName = this.formatTypeName(`${functionName}Response`);

    // 简化响应类型生成，只处理 200 响应
    const response200 =
      operation.responses['200'] || operation.responses['201'];
    if (response200?.content?.['application/json']?.schema) {
      const responseType = this.schemaToTypeScript(
        response200.content['application/json'].schema,
      );
      types.push(`export type ${typeName} = ${responseType};`);
    } else {
      types.push(`export type ${typeName} = any;`);
    }

    return types;
  }

  /**
   * 生成 Schema 类型
   */
  private generateSchemaType(name: string, schema: SchemaObject): string {
    const typeName = this.formatTypeName(name);
    const typeDefinition = this.schemaToTypeScript(schema);

    return schema.type === 'object' || schema.properties
      ? `export interface ${typeName} ${typeDefinition}`
      : `export type ${typeName} = ${typeDefinition};`;
  }

  /**
   * 获取 tag 的英文副名/没有直接返回tagName
   */
  private getTagEnglishName(tagName: string): null | string {
    if (!this.doc.tags) {
      return null;
    }

    const tag = this.doc.tags.find((t: any) => t.name === tagName);
    if (!tag?.description) {
      return tagName;
    }

    // 使用正则表达式匹配 description 中的英文名称
    // 匹配格式：（English: xxx）
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    const match = tag.description.match(/（English:\s*([^）]*)）/);
    return match ? match[1].trim() : tagName;
  }

  /**
   * 按标签分组操作
   */
  private groupOperationsByTag(): Record<
    string,
    Array<{ method: string; operation: OperationObject; path: string }>
  > {
    const groups: Record<
      string,
      Array<{ method: string; operation: OperationObject; path: string }>
    > = {};

    Object.entries(this.doc.paths).forEach(([path, pathItem]) => {
      const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;

      methods.forEach((method) => {
        const operation = pathItem[method];
        if (operation) {
          const tags = operation.tags || ['default'];

          tags.forEach((tag) => {
            if (!groups[tag]) {
              groups[tag] = [];
            }
            groups[tag].push({ method, operation, path });
          });
        }
      });
    });

    return groups;
  }

  /**
   * 参数转 TypeScript 类型
   */
  private parameterToTypeScript(param: ParameterObject): string {
    if (param.schema) {
      return this.schemaToTypeScript(param.schema);
    }
    return 'any';
  }

  /**
   * 处理路径参数，将 {id} 转换为 ${params.id}
   */
  private processPathParameters(
    path: string,
    operation: OperationObject,
  ): string {
    // 检查是否有路径参数
    const pathParams =
      operation.parameters?.filter((param) => param.in === 'path') || [];

    if (pathParams.length === 0) {
      // 没有路径参数，返回普通字符串
      return `'${path}'`;
    }

    // 有路径参数，需要使用模板字符串
    let processedPath = path;

    pathParams.forEach((param) => {
      const paramName = param.name;
      // 将 {paramName} 替换为 ${params.paramName}
      processedPath = processedPath.replaceAll(
        new RegExp(`\\{${paramName}\\}`, 'g'),
        `\${params.${paramName}}`,
      );
    });

    return `\`${processedPath}\``;
  }

  /**
   * 请求体转 TypeScript 类型
   */
  private requestBodyToTypeScript(requestBody: any): string {
    const content = requestBody.content?.['application/json'];
    if (content?.schema) {
      return this.schemaToTypeScript(content.schema);
    }
    return 'any';
  }

  /**
   * Schema 转 TypeScript 类型
   */
  private schemaToTypeScript(schema: SchemaObject): string {
    if (schema.$ref) {
      const typeName = schema.$ref.split('/').pop();
      return typeName ? this.formatTypeName(typeName) : 'any';
    }

    switch (schema.type) {
      case 'array': {
        const itemType = schema.items
          ? this.schemaToTypeScript(schema.items)
          : 'any';
        return `${itemType}[]`;
      }
      case 'boolean': {
        return 'boolean';
      }
      case 'integer':
      case 'number': {
        return 'number';
      }
      case 'object': {
        if (schema.properties) {
          const props = Object.entries(schema.properties).map(([key, prop]) => {
            const required = schema.required?.includes(key) ? '' : '?';
            const propType = this.schemaToTypeScript(prop);

            // 如果字段有描述，添加 JSDoc 注释
            if (prop.description) {
              return `  /** ${prop.description} */\n  ${key}${required}: ${propType};`;
            }

            return `  ${key}${required}: ${propType};`;
          });
          return `{\n${props.join('\n')}\n}`;
        }
        return 'Record<string, any>';
      }
      case 'string': {
        return schema.enum
          ? schema.enum.map((v) => `'${v}'`).join(' | ')
          : 'string';
      }
      default: {
        return 'any';
      }
    }
  }

  /**
   * 转换为驼峰命名
   */
  private toCamelCase(str: string): string {
    return str
      .replaceAll(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/^[A-Z]/, (letter) => letter.toLowerCase());
  }

  /**
   * 转换为帕斯卡命名
   */
  private toPascalCase(str: string): string {
    return str
      .replaceAll(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/^[a-z]/, (letter) => letter.toUpperCase());
  }

  /**
   * 转换为下划线命名
   */
  private toSnakeCase(str: string): string {
    return str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}

/**
 * 生成文件结构树
 */
function generateFileStructure(files: GeneratedFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const folderMap = new Map<string, FileTreeNode>();

  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentLevel = root;
    let currentPath = '';

    // 处理文件夹
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let folder = folderMap.get(currentPath);
      if (!folder) {
        folder = {
          children: [],
          id: currentPath,
          name: part,
          path: currentPath,
          type: 'folder',
        };
        folderMap.set(currentPath, folder);
        currentLevel.push(folder);
      }

      currentLevel = folder.children || [];
    }

    // 添加文件
    const fileName = parts[parts.length - 1];
    currentLevel.push({
      content: file.content,
      id: file.path,
      name: fileName,
      path: file.path,
      type: 'file',
    });
  });

  return root;
}
