// OpenAPI 转换器类型定义

// OpenAPI 文档结构
export interface OpenAPIDocument {
  components?: {
    schemas?: Record<string, SchemaObject>;
  };
  info: {
    description?: string;
    title: string;
    version: string;
  };
  openapi: string;
  paths: Record<string, PathItemObject>;
  tags?: TagObject[];
}

// 路径项对象
export interface PathItemObject {
  delete?: OperationObject;
  get?: OperationObject;
  head?: OperationObject;
  options?: OperationObject;
  patch?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  trace?: OperationObject;
}

// 操作对象
export interface OperationObject {
  description?: string;
  operationId?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses: Record<string, ResponseObject>;
  summary?: string;
  tags?: string[];
}

// 参数对象
export interface ParameterObject {
  description?: string;
  in: 'cookie' | 'header' | 'path' | 'query';
  name: string;
  required?: boolean;
  schema?: SchemaObject;
}

// 请求体对象
export interface RequestBodyObject {
  content: Record<string, MediaTypeObject>;
  description?: string;
  required?: boolean;
}

// 响应对象
export interface ResponseObject {
  content?: Record<string, MediaTypeObject>;
  description: string;
}

// 媒体类型对象
export interface MediaTypeObject {
  schema?: SchemaObject;
}

// Schema 对象
export interface SchemaObject {
  $ref?: string;
  allOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  description?: string;
  enum?: any[];
  format?: string;
  items?: SchemaObject;
  oneOf?: SchemaObject[];
  properties?: Record<string, SchemaObject>;
  required?: string[];
  type?: string;
}

// 标签对象
export interface TagObject {
  description?: string;
  name: string;
}

// 生成器配置
export interface GeneratorConfig {
  // 命名规则
  functionNaming: 'camelCase' | 'snake_case';
  generateIndex: boolean; // 是否生成 index.ts
  generateUtils: boolean; // 是否生成工具文件
  // 导入语句配置
  importTemplate: string; // 导入语句模板
  includeComments: boolean; // 是否包含注释
  // 输出配置
  outputTags: string[]; // 要生成的 tags
  // 文件结构
  separateTypes: boolean; // 是否分离类型文件
  createByTags: boolean; // 是否根据 tags 分文件生成
  typeNaming: 'camelCase' | 'PascalCase' | 'snake_case';
  // 代码风格
  useAsync: boolean; // 是否使用 async/await
}

// 文件树节点
export interface FileTreeNode {
  children?: FileTreeNode[];
  content?: string; // 文件内容
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
}

// 生成的文件
export interface GeneratedFile {
  content: string;
  filename: string;
  path: string;
  type: 'json' | 'typescript';
}

// 生成结果
export interface GenerateResult {
  files: GeneratedFile[];
  structure: FileTreeNode[];
}

// OpenAPI 解析选项
export interface ParseOpenAPIOptions {
  content: object | string;
  importTemplate?: string;
  namingConvention?: 'camelCase' | 'PascalCase';
  selectedTags?: string[];
}

// 解析结果
export interface ParseResult {
  data?: OpenAPIDocument;
  error?: string;
  success: boolean;
}

// 生成选项
export interface GenerateOptions {
  config: GeneratorConfig;
  openApiDoc: OpenAPIDocument;
}

// 下载选项
export interface DownloadOptions {
  filename?: string;
  files: GeneratedFile[];
}

// 默认配置
export const DEFAULT_CONFIG: GeneratorConfig = {
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
};

// 上传文件类型
export interface UploadFile {
  content: string;
  name: string;
  type: 'file' | 'url';
}

// 应用状态
export interface AppState {
  config: GeneratorConfig;
  generatedFiles: GeneratedFile[];
  isGenerating: boolean;
  selectedFile?: GeneratedFile;
  uploadedFile?: UploadFile;
}
