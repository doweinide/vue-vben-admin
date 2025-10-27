// 引入反射元数据库（必须在使用前引入）
import 'reflect-metadata';

// 定义常量作为元数据的键（避免键冲突）
const METHOD_METADATA_KEY = 'method:metadata'; // 方法装饰器的元数据键
const PARAM_METADATA_KEY = 'param:metadata'; // 参数装饰器的元数据键

// 1. 定义方法装饰器：给方法添加元数据
function MethodDecorator(metadata: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // 方法装饰器的元数据存储在【类】上，键为 METHOD_METADATA_KEY，值包含方法名和元数据
    Reflect.defineMetadata(
      METHOD_METADATA_KEY,
      { methodName: propertyKey, metadata }, // 存储方法名和元数据
      target.constructor, // 挂载到类本身（target.constructor 指向类）
    );
  };
}

// 2. 定义参数装饰器：给方法的参数添加元数据
function ParamDecorator(metadata: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // 先尝试获取该方法已有的参数元数据（如果有）
    const existingParams =
      Reflect.getMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];
    // 存储参数索引和元数据（参数装饰器按参数顺序执行）
    existingParams.push({ paramIndex: parameterIndex, metadata });
    // 参数装饰器的元数据存储在【方法】上（target 是类的原型，propertyKey 是方法名）
    Reflect.defineMetadata(
      PARAM_METADATA_KEY,
      existingParams,
      target,
      propertyKey,
    );
  };
}

// 3. 定义一个类，使用上述装饰器
class ExampleClass {
  // 给方法添加装饰器，并给参数添加装饰器
  @MethodDecorator('这是 getInfo 方法的元数据')
  getInfo(
    @ParamDecorator('参数1：用户名') username: string,
    @ParamDecorator('参数2：年龄') age: number,
  ) {
    return `User: ${username}, Age: ${age}`;
  }
}

// 4. 验证元数据的挂载位置

// 验证方法装饰器的元数据（挂载在类上）
const methodMetadata = Reflect.getMetadata(METHOD_METADATA_KEY, ExampleClass);
console.log('方法装饰器的元数据（挂载在类上）：');
console.log(methodMetadata);
// 输出：{ methodName: 'getInfo', metadata: '这是 getInfo 方法的元数据' }

// 验证参数装饰器的元数据（挂载在方法上）
// 注意：参数元数据存储在类的原型的方法上
const paramMetadata = Reflect.getMetadata(
  PARAM_METADATA_KEY,
  ExampleClass.prototype,
  'getInfo',
);
console.log('\n参数装饰器的元数据（挂载在方法上）：');
console.log(paramMetadata);
// 输出：
// [
//   { paramIndex: 0, metadata: '参数1：用户名' },
//   { paramIndex: 1, metadata: '参数2：年龄' }
// ]
