import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'direkt.publicRoute';

export const PublicRoute = (): MethodDecorator & ClassDecorator =>
  SetMetadata(PUBLIC_ROUTE_KEY, true);
