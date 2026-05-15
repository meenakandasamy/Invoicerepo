import { z } from 'zod';

const PermissionSchema = z.object({
  createdDate: z.string(),
  lastUpdatedDate: z.string(),
  activityId: z.number(),
  status: z.number(),
  create: z.number(),
  edit: z.number(),
  view: z.number(),
  activityName: z.string(),
  roleMapId: z.number().optional(),
});

const RoleBase = z.object({
  roleName: z.string(),
  roleId: z.number().optional(),
  description: z.string(),
  status: z.number(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  userMap: z.array(PermissionSchema),
  // activityMap: z.array(PermissionSchema),
});

export const RoleSaveSchema = RoleBase;
export const RoleUpdateSchema = RoleBase.extend({
  userMap: z.array(PermissionSchema),
}).partial();

export type PermissionDTOType = z.infer<typeof PermissionSchema>;
export type RoleDTOType = z.infer<typeof RoleSaveSchema>;
export type RoleUpdateDTOType = z.infer<typeof RoleUpdateSchema>;
