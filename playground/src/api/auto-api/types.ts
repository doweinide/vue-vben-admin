// 自动生成的类型定义文件
// 请勿手动修改此文件

export type get_health_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export type get__response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface get_test_validation_request {
  limit?: string;
  page?: string;
}
export type get_test_validation_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface post_test_validation_request {
  body: {
    age: number;
    email: string;
    name: string;
  };
}
export type post_test_validation_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface get_test_validation_id_request {
  id: string;
}
export type get_test_validation_id_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface post_test_validation_id_request {
  body: {
    age?: number;
    email?: string;
    name?: string;
  };
  id: string;
}
export type post_test_validation_id_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface get_users_request {
  deptId?: string;
  email?: string;
  limit?: number;
  page?: number;
  status?: number;
  username?: string;
}
export type get_users_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 数据列表 */
    items: {
      /** 用户头像 URL，可选字段，用于显示用户头像 */
      avatar?: string;
      /** 用户创建时间，自动设置为当前时间 */
      createdAt: string;
      /** 所属部门信息 */
      department?: {
        /** 创建时间 */
        createTime: string;
        /** 部门唯一标识 */
        id: string;
        /** 部门名称 */
        name: string;
        /** 父级部门ID，支持树形结构 */
        pid?: string;
        /** 备注信息 */
        remark?: string;
        /** 部门状态：0-禁用，1-启用 */
        status: number;
        /** 更新时间 */
        updateTime: string;
      };
      /** 所属部门ID */
      deptId?: string;
      /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
      email: string;
      /** 用户唯一标识符，使用 CUID 作为主键 */
      id: string;
      /** 用户真实姓名 */
      name?: string;
      /** 用户账户状态：0-禁用，1-启用 */
      status?: number;
      /** 用户信息最后更新时间，每次更新时自动更新 */
      updatedAt: string;
      /** 用户名，必须唯一，用于登录认证 */
      username: string;
      /** 用户角色关联（多对多） */
      userRoles?: {
        /** 分配时间 */
        assignedAt: string;
        /** 分配者ID（可选，记录是谁分配的角色） */
        assignedBy?: string;
        /** 关联记录唯一标识 */
        id: string;
        /** 关联的角色信息 */
        role?: {
          /** 创建时间 */
          createTime: string;
          /** 角色唯一标识 */
          id: string;
          /** 角色名称（唯一） */
          name: string;
          /** 备注信息 */
          remark?: string;
          /** 角色状态：0-禁用，1-启用 */
          status: number;
          /** 更新时间 */
          updateTime: string;
        };
        /** 角色ID */
        roleId: string;
        /** 用户ID */
        userId: string;
      }[];
    }[];
    /** 每页数量 */
    limit: number;
    /** 当前页码 */
    page: number;
    /** 总记录数 */
    total: number;
    /** 总页数 */
    totalPages: number;
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface post_users_request {
  body: {
    /** 用户头像 URL，可选字段，用于显示用户头像 */
    avatar?: string;
    /** 所属部门ID */
    deptId?: string;
    /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
    email: string;
    /** 用户真实姓名 */
    name?: string;
    /** 用户密码，存储加密后的密码哈希值 */
    password: string;
    /** 用户账户状态：0-禁用，1-启用 */
    status?: number;
    /** 用户名，必须唯一，用于登录认证 */
    username: string;
  };
}
export type post_users_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 用户头像 URL，可选字段，用于显示用户头像 */
    avatar?: string;
    /** 用户创建时间，自动设置为当前时间 */
    createdAt: string;
    /** 所属部门ID */
    deptId?: string;
    /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
    email: string;
    /** 用户唯一标识符，使用 CUID 作为主键 */
    id: string;
    /** 用户真实姓名 */
    name?: string;
    /** 用户密码，存储加密后的密码哈希值 */
    password: string;
    /** 用户账户状态：0-禁用，1-启用 */
    status?: number;
    /** 用户信息最后更新时间，每次更新时自动更新 */
    updatedAt: string;
    /** 用户名，必须唯一，用于登录认证 */
    username: string;
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface get_users_id_request {
  id: string;
}
export type get_users_id_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 用户头像 URL，可选字段，用于显示用户头像 */
    avatar?: string;
    /** 用户创建时间，自动设置为当前时间 */
    createdAt: string;
    /** 所属部门信息 */
    department?: {
      /** 创建时间 */
      createTime: string;
      /** 部门唯一标识 */
      id: string;
      /** 部门名称 */
      name: string;
      /** 父级部门ID，支持树形结构 */
      pid?: string;
      /** 备注信息 */
      remark?: string;
      /** 部门状态：0-禁用，1-启用 */
      status: number;
      /** 更新时间 */
      updateTime: string;
    };
    /** 所属部门ID */
    deptId?: string;
    /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
    email: string;
    /** 用户唯一标识符，使用 CUID 作为主键 */
    id: string;
    /** 用户真实姓名 */
    name?: string;
    /** 用户账户状态：0-禁用，1-启用 */
    status?: number;
    /** 用户信息最后更新时间，每次更新时自动更新 */
    updatedAt: string;
    /** 用户名，必须唯一，用于登录认证 */
    username: string;
    /** 用户角色关联（多对多） */
    userRoles?: {
      /** 分配时间 */
      assignedAt: string;
      /** 分配者ID（可选，记录是谁分配的角色） */
      assignedBy?: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 关联的角色信息 */
      role?: {
        /** 创建时间 */
        createTime: string;
        /** 角色唯一标识 */
        id: string;
        /** 角色名称（唯一） */
        name: string;
        /** 备注信息 */
        remark?: string;
        /** 角色状态：0-禁用，1-启用 */
        status: number;
        /** 更新时间 */
        updateTime: string;
      };
      /** 角色ID */
      roleId: string;
      /** 用户ID */
      userId: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface delete_users_id_request {
  id: string;
}
export type delete_users_id_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 删除成功消息 */
    message: string;
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface patch_users_id_request {
  body: {
    /** 用户头像 URL，可选字段，用于显示用户头像 */
    avatar?: string;
    /** 所属部门ID */
    deptId?: string;
    /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
    email?: string;
    /** 用户真实姓名 */
    name?: string;
    /** 用户密码，存储加密后的密码哈希值 */
    password?: string;
    /** 用户账户状态：0-禁用，1-启用 */
    status?: number;
    /** 用户名，必须唯一，用于登录认证 */
    username?: string;
  };
  id: string;
}
export type patch_users_id_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 用户头像 URL，可选字段，用于显示用户头像 */
    avatar?: string;
    /** 用户创建时间，自动设置为当前时间 */
    createdAt: string;
    /** 所属部门ID */
    deptId?: string;
    /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
    email: string;
    /** 用户唯一标识符，使用 CUID 作为主键 */
    id: string;
    /** 用户真实姓名 */
    name?: string;
    /** 用户密码，存储加密后的密码哈希值 */
    password: string;
    /** 用户账户状态：0-禁用，1-启用 */
    status?: number;
    /** 用户信息最后更新时间，每次更新时自动更新 */
    updatedAt: string;
    /** 用户名，必须唯一，用于登录认证 */
    username: string;
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export type get_auth_profile_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 用户头像 URL，可选字段，用于显示用户头像 */
    avatar?: string;
    /** 创建时间 */
    createTime: string;
    /** 所属部门信息 */
    department?: {
      /** 创建时间 */
      createTime: string;
      /** 部门唯一标识 */
      id: string;
      /** 部门名称（唯一） */
      name: string;
      /** 父级部门ID，支持树形结构 */
      pid?: string;
      /** 备注信息 */
      remark?: string;
      /** 部门状态：0-禁用，1-启用 */
      status: number;
      /** 更新时间 */
      updateTime: string;
    };
    /** 所属部门ID */
    deptId?: string;
    /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
    email: string;
    /** 用户唯一标识符，使用 CUID 作为主键 */
    id: string;
    /** 用户真实姓名 */
    name?: string;
    /** 用户账户状态：0-禁用，1-启用 */
    status: number;
    /** 更新时间 */
    updateTime: string;
    /** 用户名，必须唯一，用于登录认证 */
    username: string;
    /** 用户角色关联（多对多） */
    userRoles?: {
      /** 分配时间 */
      assignedAt: string;
      /** 分配人ID */
      assignedBy?: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 关联的角色信息 */
      role: {
        /** 创建时间 */
        createTime: string;
        /** 角色唯一标识 */
        id: string;
        /** 角色名称（唯一） */
        name: string;
        /** 备注信息 */
        remark?: string;
        /** 角色状态：0-禁用，1-启用 */
        status: number;
        /** 更新时间 */
        updateTime: string;
      };
      /** 角色ID */
      roleId: string;
      /** 用户ID */
      userId: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface post_auth_login_request {
  body: {
    /** 用户密码 */
    password: string;
    /** 用户名，用于登录认证 */
    username: string;
  };
}
export type post_auth_login_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** JWT访问令牌 */
    access_token: string;
    /** 用户信息 */
    user: {
      /** 用户头像 URL，可选字段，用于显示用户头像 */
      avatar?: string;
      /** 创建时间 */
      createTime: string;
      /** 所属部门信息 */
      department?: {
        /** 创建时间 */
        createTime: string;
        /** 部门唯一标识 */
        id: string;
        /** 部门名称（唯一） */
        name: string;
        /** 父级部门ID，支持树形结构 */
        pid?: string;
        /** 备注信息 */
        remark?: string;
        /** 部门状态：0-禁用，1-启用 */
        status: number;
        /** 更新时间 */
        updateTime: string;
      };
      /** 所属部门ID */
      deptId?: string;
      /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
      email: string;
      /** 用户唯一标识符，使用 CUID 作为主键 */
      id: string;
      /** 用户真实姓名 */
      name?: string;
      /** 用户账户状态：0-禁用，1-启用 */
      status: number;
      /** 更新时间 */
      updateTime: string;
      /** 用户名，必须唯一，用于登录认证 */
      username: string;
      /** 用户角色关联（多对多） */
      userRoles?: {
        /** 分配时间 */
        assignedAt: string;
        /** 分配人ID */
        assignedBy?: string;
        /** 关联记录唯一标识 */
        id: string;
        /** 关联的角色信息 */
        role: {
          /** 创建时间 */
          createTime: string;
          /** 角色唯一标识 */
          id: string;
          /** 角色名称（唯一） */
          name: string;
          /** 备注信息 */
          remark?: string;
          /** 角色状态：0-禁用，1-启用 */
          status: number;
          /** 更新时间 */
          updateTime: string;
        };
        /** 角色ID */
        roleId: string;
        /** 用户ID */
        userId: string;
      }[];
    };
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface post_system_dept_request {
  body: {
    /** 部门名称 */
    name: string;
    /** 父级部门ID，支持树形结构 */
    pid?: string;
    /** 备注信息 */
    remark?: string;
    /** 部门状态：0-禁用，1-启用 */
    status?: number;
  };
}
export type post_system_dept_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 子级部门ID列表 */
    childrenIds?: string[];
    /** 创建时间 */
    createTime: string;
    /** 部门唯一标识 */
    id: string;
    /** 部门名称 */
    name: string;
    /** 父级部门ID */
    parentId?: string;
    /** 父级部门ID，支持树形结构 */
    pid?: string;
    /** 备注信息 */
    remark?: string;
    /** 部门状态：0-禁用，1-启用 */
    status: number;
    /** 更新时间 */
    updateTime: string;
    /** 部门下的用户 */
    users?: {
      /** 用户头像 URL，可选字段，用于显示用户头像 */
      avatar?: string;
      /** 用户创建时间，自动设置为当前时间 */
      createdAt: string;
      /** 所属部门ID */
      deptId?: string;
      /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
      email: string;
      /** 用户唯一标识符，使用 CUID 作为主键 */
      id: string;
      /** 用户真实姓名 */
      name?: string;
      /** 用户账户状态：0-禁用，1-启用 */
      status: number;
      /** 用户信息最后更新时间，每次更新时自动更新 */
      updatedAt: string;
      /** 用户名，必须唯一，用于登录认证 */
      username: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface get_system_dept_list_request {
  limit?: number;
  name?: string;
  page?: number;
  pid?: string;
  status?: number;
}
export type get_system_dept_list_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 子级部门ID列表 */
    childrenIds?: string[];
    /** 创建时间 */
    createTime: string;
    /** 部门唯一标识 */
    id: string;
    /** 部门名称 */
    name: string;
    /** 父级部门ID */
    parentId?: string;
    /** 父级部门ID，支持树形结构 */
    pid?: string;
    /** 备注信息 */
    remark?: string;
    /** 部门状态：0-禁用，1-启用 */
    status: number;
    /** 更新时间 */
    updateTime: string;
    /** 部门下的用户 */
    users?: {
      /** 用户头像 URL，可选字段，用于显示用户头像 */
      avatar?: string;
      /** 用户创建时间，自动设置为当前时间 */
      createdAt: string;
      /** 所属部门ID */
      deptId?: string;
      /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
      email: string;
      /** 用户唯一标识符，使用 CUID 作为主键 */
      id: string;
      /** 用户真实姓名 */
      name?: string;
      /** 用户账户状态：0-禁用，1-启用 */
      status: number;
      /** 用户信息最后更新时间，每次更新时自动更新 */
      updatedAt: string;
      /** 用户名，必须唯一，用于登录认证 */
      username: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface get_system_dept_id_request {
  id: string;
}
export type get_system_dept_id_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 子级部门ID列表 */
    childrenIds?: string[];
    /** 创建时间 */
    createTime: string;
    /** 部门唯一标识 */
    id: string;
    /** 部门名称 */
    name: string;
    /** 父级部门ID */
    parentId?: string;
    /** 父级部门ID，支持树形结构 */
    pid?: string;
    /** 备注信息 */
    remark?: string;
    /** 部门状态：0-禁用，1-启用 */
    status: number;
    /** 更新时间 */
    updateTime: string;
    /** 部门下的用户 */
    users?: {
      /** 用户头像 URL，可选字段，用于显示用户头像 */
      avatar?: string;
      /** 用户创建时间，自动设置为当前时间 */
      createdAt: string;
      /** 所属部门ID */
      deptId?: string;
      /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
      email: string;
      /** 用户唯一标识符，使用 CUID 作为主键 */
      id: string;
      /** 用户真实姓名 */
      name?: string;
      /** 用户账户状态：0-禁用，1-启用 */
      status: number;
      /** 用户信息最后更新时间，每次更新时自动更新 */
      updatedAt: string;
      /** 用户名，必须唯一，用于登录认证 */
      username: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface delete_system_dept_id_request {
  id: string;
}
export type delete_system_dept_id_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface patch_system_dept_id_request {
  body: {
    /** 部门名称 */
    name?: string;
    /** 父级部门ID，支持树形结构 */
    pid?: string;
    /** 备注信息 */
    remark?: string;
    /** 部门状态：0-禁用，1-启用 */
    status?: number;
  };
  id: string;
}
export type patch_system_dept_id_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 子级部门ID列表 */
    childrenIds?: string[];
    /** 创建时间 */
    createTime: string;
    /** 部门唯一标识 */
    id: string;
    /** 部门名称 */
    name: string;
    /** 父级部门ID */
    parentId?: string;
    /** 父级部门ID，支持树形结构 */
    pid?: string;
    /** 备注信息 */
    remark?: string;
    /** 部门状态：0-禁用，1-启用 */
    status: number;
    /** 更新时间 */
    updateTime: string;
    /** 部门下的用户 */
    users?: {
      /** 用户头像 URL，可选字段，用于显示用户头像 */
      avatar?: string;
      /** 用户创建时间，自动设置为当前时间 */
      createdAt: string;
      /** 所属部门ID */
      deptId?: string;
      /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
      email: string;
      /** 用户唯一标识符，使用 CUID 作为主键 */
      id: string;
      /** 用户真实姓名 */
      name?: string;
      /** 用户账户状态：0-禁用，1-启用 */
      status: number;
      /** 用户信息最后更新时间，每次更新时自动更新 */
      updatedAt: string;
      /** 用户名，必须唯一，用于登录认证 */
      username: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface post_system_menu_request {
  body: {
    /** 权限标识码 */
    authCode?: string;
    /** 组件路径 */
    component?: string;
    /** 菜单元数据（JSON格式存储图标、标题等信息） */
    meta?: {
      /** 是否固定标签页 */
      affix?: boolean;
      /** 是否携带参数 */
      carryParam?: boolean;
      /** 当前激活菜单 */
      currentActiveMenu?: string;
      /** 外部链接地址 */
      externalLink?: string;
      /** 内嵌框架地址 */
      frameSrc?: string;
      /** 是否隐藏子菜单 */
      hideChildrenInMenu?: boolean;
      /** 是否在面包屑中隐藏 */
      hideInBreadcrumb?: boolean;
      /** 是否在菜单中隐藏 */
      hideInMenu?: boolean;
      /** 是否隐藏菜单 */
      hideMenu?: boolean;
      /** 是否为子级隐藏路径 */
      hidePathForChildren?: boolean;
      /** 是否隐藏标签页 */
      hideTab?: boolean;
      /** 菜单图标 */
      icon?: string;
      /** 是否忽略缓存 */
      ignoreKeepAlive?: boolean;
      /** 是否忽略路由 */
      ignoreRoute?: boolean;
      /** 是否为外链 */
      isLink?: boolean;
      /** 排序号 */
      orderNo?: number;
      /** 是否单独显示 */
      single?: boolean;
      /** 菜单标题 */
      title?: string;
    };
    /** 菜单名称（唯一） */
    name: string;
    /** 路由路径（唯一，可为空） */
    path?: string;
    /** 父级菜单ID，支持树形结构 */
    pid?: string;
    /** 菜单状态：0-禁用，1-启用 */
    status?: number;
    /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
    type: 'button' | 'catalog' | 'embedded' | 'link' | 'menu';
  };
}
export type post_system_menu_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 权限标识码 */
    authCode?: string;
    /** 子级菜单ID列表 */
    childrenIds?: string[];
    /** 组件路径 */
    component?: string;
    /** 创建时间 */
    createTime: string;
    /** 菜单唯一标识 */
    id: string;
    /** 菜单元数据（JSON格式存储图标、标题等信息） */
    meta?: any;
    /** 菜单名称（唯一） */
    name: string;
    /** 父级菜单ID */
    parentId?: string;
    /** 路由路径（唯一，可为空） */
    path?: string;
    /** 父级菜单ID，支持树形结构 */
    pid?: string;
    /** 角色权限关联 */
    rolePermissions?: {
      /** 创建时间 */
      createTime: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 菜单ID */
      menuId: string;
      /** 关联的角色信息 */
      role?: {
        /** 创建时间 */
        createTime: string;
        /** 角色唯一标识 */
        id: string;
        /** 角色名称（唯一） */
        name: string;
        /** 备注信息 */
        remark?: string;
        /** 角色状态：0-禁用，1-启用 */
        status: number;
        /** 更新时间 */
        updateTime: string;
      };
      /** 角色ID */
      roleId: string;
    }[];
    /** 菜单状态：0-禁用，1-启用 */
    status: number;
    /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
    type: string;
    /** 更新时间 */
    updateTime: string;
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface get_system_menu_list_request {
  limit?: number;
  name?: string;
  page?: number;
  pid?: string;
  status?: number;
  type?: 'button' | 'catalog' | 'embedded' | 'link' | 'menu';
}
export type get_system_menu_list_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 权限标识码 */
    authCode?: string;
    /** 子级菜单ID列表 */
    childrenIds?: string[];
    /** 组件路径 */
    component?: string;
    /** 创建时间 */
    createTime: string;
    /** 菜单唯一标识 */
    id: string;
    /** 菜单元数据（JSON格式存储图标、标题等信息） */
    meta?: any;
    /** 菜单名称（唯一） */
    name: string;
    /** 父级菜单ID */
    parentId?: string;
    /** 路由路径（唯一，可为空） */
    path?: string;
    /** 父级菜单ID，支持树形结构 */
    pid?: string;
    /** 角色权限关联 */
    rolePermissions?: {
      /** 创建时间 */
      createTime: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 菜单ID */
      menuId: string;
      /** 关联的角色信息 */
      role?: {
        /** 创建时间 */
        createTime: string;
        /** 角色唯一标识 */
        id: string;
        /** 角色名称（唯一） */
        name: string;
        /** 备注信息 */
        remark?: string;
        /** 角色状态：0-禁用，1-启用 */
        status: number;
        /** 更新时间 */
        updateTime: string;
      };
      /** 角色ID */
      roleId: string;
    }[];
    /** 菜单状态：0-禁用，1-启用 */
    status: number;
    /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
    type: string;
    /** 更新时间 */
    updateTime: string;
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface get_system_menu_id_request {
  id: string;
}
export type get_system_menu_id_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 权限标识码 */
    authCode?: string;
    /** 子级菜单ID列表 */
    childrenIds?: string[];
    /** 组件路径 */
    component?: string;
    /** 创建时间 */
    createTime: string;
    /** 菜单唯一标识 */
    id: string;
    /** 菜单元数据（JSON格式存储图标、标题等信息） */
    meta?: any;
    /** 菜单名称（唯一） */
    name: string;
    /** 父级菜单ID */
    parentId?: string;
    /** 路由路径（唯一，可为空） */
    path?: string;
    /** 父级菜单ID，支持树形结构 */
    pid?: string;
    /** 角色权限关联 */
    rolePermissions?: {
      /** 创建时间 */
      createTime: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 菜单ID */
      menuId: string;
      /** 关联的角色信息 */
      role?: {
        /** 创建时间 */
        createTime: string;
        /** 角色唯一标识 */
        id: string;
        /** 角色名称（唯一） */
        name: string;
        /** 备注信息 */
        remark?: string;
        /** 角色状态：0-禁用，1-启用 */
        status: number;
        /** 更新时间 */
        updateTime: string;
      };
      /** 角色ID */
      roleId: string;
    }[];
    /** 菜单状态：0-禁用，1-启用 */
    status: number;
    /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
    type: string;
    /** 更新时间 */
    updateTime: string;
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface delete_system_menu_id_request {
  id: string;
}
export type delete_system_menu_id_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface patch_system_menu_id_request {
  body: {
    /** 权限标识码 */
    authCode?: string;
    /** 组件路径 */
    component?: string;
    /** 菜单元数据（JSON格式存储图标、标题等信息） */
    meta?: {
      /** 是否固定标签页 */
      affix?: boolean;
      /** 是否携带参数 */
      carryParam?: boolean;
      /** 当前激活菜单 */
      currentActiveMenu?: string;
      /** 外部链接地址 */
      externalLink?: string;
      /** 内嵌框架地址 */
      frameSrc?: string;
      /** 是否隐藏子菜单 */
      hideChildrenInMenu?: boolean;
      /** 是否在面包屑中隐藏 */
      hideInBreadcrumb?: boolean;
      /** 是否在菜单中隐藏 */
      hideInMenu?: boolean;
      /** 是否隐藏菜单 */
      hideMenu?: boolean;
      /** 是否为子级隐藏路径 */
      hidePathForChildren?: boolean;
      /** 是否隐藏标签页 */
      hideTab?: boolean;
      /** 菜单图标 */
      icon?: string;
      /** 是否忽略缓存 */
      ignoreKeepAlive?: boolean;
      /** 是否忽略路由 */
      ignoreRoute?: boolean;
      /** 是否为外链 */
      isLink?: boolean;
      /** 排序号 */
      orderNo?: number;
      /** 是否单独显示 */
      single?: boolean;
      /** 菜单标题 */
      title?: string;
    };
    /** 菜单名称（唯一） */
    name?: string;
    /** 路由路径（唯一，可为空） */
    path?: string;
    /** 父级菜单ID，支持树形结构 */
    pid?: string;
    /** 菜单状态：0-禁用，1-启用 */
    status?: number;
    /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
    type?: 'button' | 'catalog' | 'embedded' | 'link' | 'menu';
  };
  id: string;
}
export type patch_system_menu_id_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 权限标识码 */
    authCode?: string;
    /** 子级菜单ID列表 */
    childrenIds?: string[];
    /** 组件路径 */
    component?: string;
    /** 创建时间 */
    createTime: string;
    /** 菜单唯一标识 */
    id: string;
    /** 菜单元数据（JSON格式存储图标、标题等信息） */
    meta?: any;
    /** 菜单名称（唯一） */
    name: string;
    /** 父级菜单ID */
    parentId?: string;
    /** 路由路径（唯一，可为空） */
    path?: string;
    /** 父级菜单ID，支持树形结构 */
    pid?: string;
    /** 角色权限关联 */
    rolePermissions?: {
      /** 创建时间 */
      createTime: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 菜单ID */
      menuId: string;
      /** 关联的角色信息 */
      role?: {
        /** 创建时间 */
        createTime: string;
        /** 角色唯一标识 */
        id: string;
        /** 角色名称（唯一） */
        name: string;
        /** 备注信息 */
        remark?: string;
        /** 角色状态：0-禁用，1-启用 */
        status: number;
        /** 更新时间 */
        updateTime: string;
      };
      /** 角色ID */
      roleId: string;
    }[];
    /** 菜单状态：0-禁用，1-启用 */
    status: number;
    /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
    type: string;
    /** 更新时间 */
    updateTime: string;
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface get_system_menu_name_exists_request {
  id?: string;
  name: string;
}
export type get_system_menu_name_exists_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface get_system_menu_path_exists_request {
  id?: string;
  path: string;
}
export type get_system_menu_path_exists_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface get_roles_id_permissions_request {
  id: string;
}
export type get_roles_id_permissions_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface post_roles_id_permissions_request {
  body: {
    /** 菜单权限ID列表 */
    menuIds: string[];
    /** 角色唯一标识 */
    roleId: string;
  };
  id: string;
}
export type post_roles_id_permissions_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface post_roles_check_name_request {
  body: {
    /** 角色名称（唯一） */
    name: string;
  };
}
export type post_roles_check_name_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface get_roles_request {
  limit?: number;
  name?: string;
  page?: number;
  status?: number;
}
export type get_roles_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 创建时间 */
    createTime: string;
    /** 角色唯一标识 */
    id: string;
    /** 角色名称（唯一） */
    name: string;
    /** 备注信息 */
    remark?: string;
    /** 角色权限关联 */
    rolePermissions?: {
      /** 创建时间 */
      createTime: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 关联的菜单信息 */
      menu?: {
        /** 权限标识码 */
        authCode?: string;
        /** 组件路径 */
        component?: string;
        /** 创建时间 */
        createTime: string;
        /** 菜单唯一标识 */
        id: string;
        /** 菜单名称（唯一） */
        name: string;
        /** 路由路径（唯一，可为空） */
        path?: string;
        /** 菜单状态：0-禁用，1-启用 */
        status: number;
        /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
        type: string;
        /** 更新时间 */
        updateTime: string;
      };
      /** 菜单ID */
      menuId: string;
      /** 角色ID */
      roleId: string;
    }[];
    /** 角色状态：0-禁用，1-启用 */
    status: number;
    /** 更新时间 */
    updateTime: string;
    /** 角色下的用户（多对多关联） */
    userRoles?: {
      /** 分配时间 */
      assignedAt: string;
      /** 分配者ID（可选，记录是谁分配的角色） */
      assignedBy?: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 角色ID */
      roleId: string;
      /** 关联的用户信息 */
      user?: {
        /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
        email: string;
        /** 用户唯一标识符，使用 CUID 作为主键 */
        id: string;
        /** 用户真实姓名 */
        name?: string;
        /** 用户账户状态：0-禁用，1-启用 */
        status: number;
        /** 用户名，必须唯一，用于登录认证 */
        username: string;
      };
      /** 用户ID */
      userId: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface post_roles_request {
  body: {
    /** 菜单权限ID列表 */
    menuIds?: string[];
    /** 角色名称（唯一） */
    name: string;
    /** 备注信息 */
    remark?: string;
    /** 角色状态：0-禁用，1-启用 */
    status?: number;
  };
}
export type post_roles_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 创建时间 */
    createTime: string;
    /** 角色唯一标识 */
    id: string;
    /** 角色名称（唯一） */
    name: string;
    /** 备注信息 */
    remark?: string;
    /** 角色权限关联 */
    rolePermissions?: {
      /** 创建时间 */
      createTime: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 关联的菜单信息 */
      menu?: {
        /** 权限标识码 */
        authCode?: string;
        /** 组件路径 */
        component?: string;
        /** 创建时间 */
        createTime: string;
        /** 菜单唯一标识 */
        id: string;
        /** 菜单名称（唯一） */
        name: string;
        /** 路由路径（唯一，可为空） */
        path?: string;
        /** 菜单状态：0-禁用，1-启用 */
        status: number;
        /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
        type: string;
        /** 更新时间 */
        updateTime: string;
      };
      /** 菜单ID */
      menuId: string;
      /** 角色ID */
      roleId: string;
    }[];
    /** 角色状态：0-禁用，1-启用 */
    status: number;
    /** 更新时间 */
    updateTime: string;
    /** 角色下的用户（多对多关联） */
    userRoles?: {
      /** 分配时间 */
      assignedAt: string;
      /** 分配者ID（可选，记录是谁分配的角色） */
      assignedBy?: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 角色ID */
      roleId: string;
      /** 关联的用户信息 */
      user?: {
        /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
        email: string;
        /** 用户唯一标识符，使用 CUID 作为主键 */
        id: string;
        /** 用户真实姓名 */
        name?: string;
        /** 用户账户状态：0-禁用，1-启用 */
        status: number;
        /** 用户名，必须唯一，用于登录认证 */
        username: string;
      };
      /** 用户ID */
      userId: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface get_roles_id_request {
  id: string;
}
export type get_roles_id_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 创建时间 */
    createTime: string;
    /** 角色唯一标识 */
    id: string;
    /** 角色名称（唯一） */
    name: string;
    /** 备注信息 */
    remark?: string;
    /** 角色权限关联 */
    rolePermissions?: {
      /** 创建时间 */
      createTime: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 关联的菜单信息 */
      menu?: {
        /** 权限标识码 */
        authCode?: string;
        /** 组件路径 */
        component?: string;
        /** 创建时间 */
        createTime: string;
        /** 菜单唯一标识 */
        id: string;
        /** 菜单名称（唯一） */
        name: string;
        /** 路由路径（唯一，可为空） */
        path?: string;
        /** 菜单状态：0-禁用，1-启用 */
        status: number;
        /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
        type: string;
        /** 更新时间 */
        updateTime: string;
      };
      /** 菜单ID */
      menuId: string;
      /** 角色ID */
      roleId: string;
    }[];
    /** 角色状态：0-禁用，1-启用 */
    status: number;
    /** 更新时间 */
    updateTime: string;
    /** 角色下的用户（多对多关联） */
    userRoles?: {
      /** 分配时间 */
      assignedAt: string;
      /** 分配者ID（可选，记录是谁分配的角色） */
      assignedBy?: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 角色ID */
      roleId: string;
      /** 关联的用户信息 */
      user?: {
        /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
        email: string;
        /** 用户唯一标识符，使用 CUID 作为主键 */
        id: string;
        /** 用户真实姓名 */
        name?: string;
        /** 用户账户状态：0-禁用，1-启用 */
        status: number;
        /** 用户名，必须唯一，用于登录认证 */
        username: string;
      };
      /** 用户ID */
      userId: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
export interface delete_roles_id_request {
  id: string;
}
export type delete_roles_id_response = {
  code?: number;
  data?: Record<string, any>;
  message?: string;
};
export interface patch_roles_id_request {
  body: {
    /** 菜单权限ID列表 */
    menuIds?: string[];
    /** 角色名称（唯一） */
    name?: string;
    /** 备注信息 */
    remark?: string;
    /** 角色状态：0-禁用，1-启用 */
    status?: number;
  };
  id: string;
}
export type patch_roles_id_response = {
  /** 响应状态码，200表示成功，其他表示错误 */
  code: number;
  /** 响应数据 */
  data: {
    /** 创建时间 */
    createTime: string;
    /** 角色唯一标识 */
    id: string;
    /** 角色名称（唯一） */
    name: string;
    /** 备注信息 */
    remark?: string;
    /** 角色权限关联 */
    rolePermissions?: {
      /** 创建时间 */
      createTime: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 关联的菜单信息 */
      menu?: {
        /** 权限标识码 */
        authCode?: string;
        /** 组件路径 */
        component?: string;
        /** 创建时间 */
        createTime: string;
        /** 菜单唯一标识 */
        id: string;
        /** 菜单名称（唯一） */
        name: string;
        /** 路由路径（唯一，可为空） */
        path?: string;
        /** 菜单状态：0-禁用，1-启用 */
        status: number;
        /** 菜单类型：catalog-目录，menu-菜单，button-按钮，embedded-内嵌，link-外链 */
        type: string;
        /** 更新时间 */
        updateTime: string;
      };
      /** 菜单ID */
      menuId: string;
      /** 角色ID */
      roleId: string;
    }[];
    /** 角色状态：0-禁用，1-启用 */
    status: number;
    /** 更新时间 */
    updateTime: string;
    /** 角色下的用户（多对多关联） */
    userRoles?: {
      /** 分配时间 */
      assignedAt: string;
      /** 分配者ID（可选，记录是谁分配的角色） */
      assignedBy?: string;
      /** 关联记录唯一标识 */
      id: string;
      /** 角色ID */
      roleId: string;
      /** 关联的用户信息 */
      user?: {
        /** 用户邮箱地址，必须唯一，可用于找回密码等功能 */
        email: string;
        /** 用户唯一标识符，使用 CUID 作为主键 */
        id: string;
        /** 用户真实姓名 */
        name?: string;
        /** 用户账户状态：0-禁用，1-启用 */
        status: number;
        /** 用户名，必须唯一，用于登录认证 */
        username: string;
      };
      /** 用户ID */
      userId: string;
    }[];
  };
  /** 响应消息，描述操作结果 */
  message: string;
};
