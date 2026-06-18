import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";


export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext) {
        const roles = this.reflector.get<Role[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
         const hasRole = roles.includes(user.role)
         if(!hasRole) {
            throw new ForbiddenException(`Chỉ ${roles.join(', ')} mới có quyền truy cập`)
         }
         return true;
    }

}