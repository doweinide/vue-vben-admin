import type {
  OpenAPIDocument,
  OperationObject,
  ParseOpenAPIOptions,
  ParseResult,
  PathItemObject,
  SchemaObject,
} from './types/openapi';

// OpenAPI 解析器
import * as yaml from 'js-yaml';

/**
 * 解析 OpenAPI 文档
 * @param options 解析选项
 * @returns 解析结果
 */
export function parseOpenAPI(options: ParseOpenAPIOptions): ParseResult {
  try {
    const { content } = options;

    // 解析内容（支持 JSON 和 YAML 格式）
    const doc: OpenAPIDocument =
      typeof content === 'string'
        ? parseContent(content)
        : (content as OpenAPIDocument);

    // 验证 OpenAPI 文档格式
    const validationResult = validateOpenAPIDocument(doc);
    if (!validationResult.valid) {
      return {
        error: validationResult.error,
        success: false,
      };
    }

    // 处理和标准化文档
    const processedDoc = processOpenAPIDocument(doc);

    return {
      data: processedDoc,
      success: true,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : '解析失败',
      success: false,
    };
  }
}

/**
 * 解析内容（自动检测 JSON 或 YAML 格式）
 * @param content 文档内容
 * @returns 解析后的对象
 */
function parseContent(content: string): OpenAPIDocument {
  const trimmedContent = content.trim();

  // 检测是否为 JSON 格式
  if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
    try {
      return JSON.parse(content);
    } catch {
      // JSON 解析失败，尝试 YAML
      return yaml.load(content) as OpenAPIDocument;
    }
  }

  // 默认尝试 YAML 解析
  try {
    return yaml.load(content) as OpenAPIDocument;
  } catch {
    // YAML 解析失败，最后尝试 JSON
    return JSON.parse(content);
  }
}

/**
 * 验证 OpenAPI 文档格式
 * @param doc OpenAPI 文档
 * @returns 验证结果
 */
function validateOpenAPIDocument(doc: any): { error?: string; valid: boolean } {
  // 检查基本结构
  if (!doc || typeof doc !== 'object') {
    return { error: '文档格式不正确', valid: false };
  }

  // 检查 OpenAPI 版本
  if (!doc.openapi) {
    return { error: '缺少 openapi 字段', valid: false };
  }

  if (!doc.openapi.startsWith('3.')) {
    return { error: '仅支持 OpenAPI 3.x 版本', valid: false };
  }

  // 支持 OpenAPI 3.0.x 和 3.1.x 版本
  const version = doc.openapi;
  if (!/^3\.[01]\./.test(version)) {
    return { error: '仅支持 OpenAPI 3.0.x 和 3.1.x 版本', valid: false };
  }

  // 检查 info 字段
  if (!doc.info || typeof doc.info !== 'object') {
    return { error: '缺少 info 字段', valid: false };
  }

  if (!doc.info.title || !doc.info.version) {
    return { error: 'info 字段缺少 title 或 version', valid: false };
  }

  // 检查 paths 字段
  if (!doc.paths || typeof doc.paths !== 'object') {
    return { error: '缺少 paths 字段', valid: false };
  }

  return { valid: true };
}

/**
 * 处理和标准化 OpenAPI 文档
 * @param doc 原始文档
 * @returns 处理后的文档
 */
function processOpenAPIDocument(doc: OpenAPIDocument): OpenAPIDocument {
  const processedDoc: OpenAPIDocument = {
    ...doc,
    components: doc.components ? processComponents(doc.components) : undefined,
    paths: processPaths(doc.paths),
    tags: doc.tags || [],
  };

  // 如果没有 tags，从 paths 中提取
  if (!processedDoc.tags || processedDoc.tags.length === 0) {
    processedDoc.tags = extractTagsFromPaths(processedDoc.paths);
  }

  return processedDoc;
}

/**
 * 处理路径对象
 * @param paths 路径对象
 * @returns 处理后的路径对象
 */
function processPaths(
  paths: Record<string, PathItemObject>,
): Record<string, PathItemObject> {
  const processedPaths: Record<string, PathItemObject> = {};

  Object.entries(paths).forEach(([path, pathItem]) => {
    processedPaths[path] = processPathItem(pathItem);
  });

  return processedPaths;
}

/**
 * 处理路径项
 * @param pathItem 路径项
 * @returns 处理后的路径项
 */
function processPathItem(pathItem: PathItemObject): PathItemObject {
  const processedPathItem: PathItemObject = {};

  // 处理所有 HTTP 方法
  const methods = [
    'get',
    'post',
    'put',
    'delete',
    'patch',
    'head',
    'options',
    'trace',
  ] as const;

  methods.forEach((method) => {
    if (pathItem[method]) {
      const operation = pathItem[method];
      if (operation) {
        processedPathItem[method] = processOperation(operation);
      }
    }
  });

  return processedPathItem;
}

/**
 * 处理操作对象
 * @param operation 操作对象
 * @returns 处理后的操作对象
 */
function processOperation(operation: OperationObject): OperationObject {
  return {
    ...operation,
    description: operation.description || '',
    operationId: operation.operationId || generateOperationId(operation),
    parameters: operation.parameters || [],
    responses: operation.responses || {},
    summary: operation.summary || '',
    tags: operation.tags || ['default'],
  };
}

/**
 * 生成操作 ID
 * @param operation 操作对象
 * @returns 生成的操作 ID
 */
function generateOperationId(operation: OperationObject): string {
  // 基于 summary 或 description 生成 ID
  const text = operation.summary || operation.description || 'operation';
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replaceAll(/^_+|_+$/g, '')
    .slice(0, 50);
}

/**
 * 处理组件对象
 * @param components 组件对象
 * @returns 处理后的组件对象
 */
function processComponents(components: any): any {
  return {
    ...components,
    schemas: components.schemas
      ? processSchemas(components.schemas)
      : undefined,
  };
}

/**
 * 处理 Schema 对象
 * @param schemas Schema 对象集合
 * @returns 处理后的 Schema 对象集合
 */
function processSchemas(
  schemas: Record<string, SchemaObject>,
): Record<string, SchemaObject> {
  const processedSchemas: Record<string, SchemaObject> = {};

  Object.entries(schemas).forEach(([name, schema]) => {
    processedSchemas[name] = processSchema(schema);
  });

  return processedSchemas;
}

/**
 * 处理单个 Schema
 * @param schema Schema 对象
 * @returns 处理后的 Schema 对象
 */
function processSchema(schema: SchemaObject): SchemaObject {
  const processedSchema: SchemaObject = { ...schema };

  // 处理嵌套的 properties
  if (schema.properties) {
    processedSchema.properties = {};
    Object.entries(schema.properties).forEach(([key, prop]) => {
      if (!processedSchema.properties) {
        processedSchema.properties = {};
      }
      processedSchema.properties[key] = processSchema(prop);
    });
  }

  // 处理数组项
  if (schema.items) {
    processedSchema.items = processSchema(schema.items);
  }

  // 处理 allOf, oneOf, anyOf
  if (schema.allOf) {
    processedSchema.allOf = schema.allOf.map((s) => processSchema(s));
  }
  if (schema.oneOf) {
    processedSchema.oneOf = schema.oneOf.map((s) => processSchema(s));
  }
  if (schema.anyOf) {
    processedSchema.anyOf = schema.anyOf.map((s) => processSchema(s));
  }

  return processedSchema;
}

/**
 * 从路径中提取标签
 * @param paths 路径对象
 * @returns 提取的标签数组
 */
function extractTagsFromPaths(
  paths: Record<string, PathItemObject>,
): Array<{ description?: string; name: string }> {
  const tagSet = new Set<string>();

  Object.values(paths).forEach((pathItem) => {
    const methods = [
      'get',
      'post',
      'put',
      'delete',
      'patch',
      'head',
      'options',
      'trace',
    ] as const;

    methods.forEach((method) => {
      const operation = pathItem[method];
      if (operation?.tags) {
        operation.tags.forEach((tag) => tagSet.add(tag));
      }
    });
  });

  return [...tagSet].map((name) => ({ name }));
}

/**
 * 获取所有可用的标签
 * @param doc OpenAPI 文档
 * @returns 标签名称数组
 */
export function getAvailableTags(doc: OpenAPIDocument): string[] {
  if (doc.tags && doc.tags.length > 0) {
    return doc.tags.map((tag) => tag.name);
  }

  // 从路径中提取标签
  const tags = extractTagsFromPaths(doc.paths);
  return tags.map((tag) => tag.name);
}

/**
 * 根据标签过滤路径
 * @param doc OpenAPI 文档
 * @param selectedTags 选中的标签
 * @returns 过滤后的文档
 */
export function filterByTags(
  doc: OpenAPIDocument,
  selectedTags: string[],
): OpenAPIDocument {
  if (selectedTags.length === 0) {
    return doc;
  }

  const filteredPaths: Record<string, PathItemObject> = {};

  Object.entries(doc.paths).forEach(([path, pathItem]) => {
    const filteredPathItem: PathItemObject = {};
    let hasMatchingOperation = false;

    const methods = [
      'get',
      'post',
      'put',
      'delete',
      'patch',
      'head',
      'options',
      'trace',
    ] as const;

    methods.forEach((method) => {
      const operation = pathItem[method];
      if (operation) {
        const operationTags = operation.tags || ['default'];
        const hasMatchingTag = operationTags.some((tag) =>
          selectedTags.includes(tag),
        );

        if (hasMatchingTag) {
          filteredPathItem[method] = operation;
          hasMatchingOperation = true;
        }
      }
    });

    if (hasMatchingOperation) {
      filteredPaths[path] = filteredPathItem;
    }
  });

  return {
    ...doc,
    paths: filteredPaths,
  };
}

/**
 * 获取路径统计信息
 * @param doc OpenAPI 文档
 * @returns 统计信息
 */
export function getPathStatistics(doc: OpenAPIDocument) {
  let totalOperations = 0;
  const methodCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  Object.values(doc.paths).forEach((pathItem) => {
    const methods = [
      'get',
      'post',
      'put',
      'delete',
      'patch',
      'head',
      'options',
      'trace',
    ] as const;

    methods.forEach((method) => {
      const operation = pathItem[method];
      if (operation) {
        totalOperations++;
        methodCounts[method] = (methodCounts[method] || 0) + 1;

        const tags = operation.tags || ['default'];
        tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
  });

  return {
    methodCounts,
    tagCounts,
    totalOperations,
    totalPaths: Object.keys(doc.paths).length,
  };
}
