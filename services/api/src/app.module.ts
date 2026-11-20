// The root module. Every feature registers its module here, nothing else.
import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ZodSerializerInterceptor } from "nestjs-zod";
import { ErrorsFilter } from "./errors.filter";
import { HealthModule } from "./features/health/health.module";
import { NotesModule } from "./features/notes/notes.module";

@Module({
  imports: [HealthModule, NotesModule],
  providers: [
    { provide: APP_FILTER, useClass: ErrorsFilter },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
