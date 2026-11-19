import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { createZodDto, ZodResponse } from "nestjs-zod";
import { z } from "zod";

class HealthDto extends createZodDto(z.object({ ok: z.boolean() }).meta({ id: "Health" })) {}

@ApiTags("system")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ operationId: "getHealth" })
  @ZodResponse({ status: 200, description: "Service is up", type: HealthDto })
  get() {
    return { ok: true };
  }
}
