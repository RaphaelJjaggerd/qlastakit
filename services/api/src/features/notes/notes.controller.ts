// HTTP layer only: parse the request, call one core function, map the result.
import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateNote, Note } from "@qlastakit/core";
import { createZodDto, ZodResponse } from "nestjs-zod";
import { z } from "zod";
import { NOTES, type Notes } from "./notes.providers";

class NoteDto extends createZodDto(Note) {}
class NoteListDto extends createZodDto(z.array(Note)) {}
class CreateNoteDto extends createZodDto(CreateNote) {}

@ApiTags("notes")
@Controller("notes")
export class NotesController {
  constructor(@Inject(NOTES) private readonly notes: Notes) {}

  @Get()
  @ApiOperation({ operationId: "listNotes" })
  @ZodResponse({ status: 200, description: "Latest notes", type: NoteListDto })
  list() {
    return this.notes.list();
  }

  @Post()
  @ApiOperation({ operationId: "createNote" })
  @ApiBody({ type: CreateNoteDto })
  @ZodResponse({ status: 201, description: "Created note", type: NoteDto })
  create(@Body() body: unknown) {
    // Core validates the input and throws the coded validation_error itself.
    return this.notes.create(body);
  }
}
