import { Module } from "@nestjs/common";
import { NotesController } from "./notes.controller";
import { notesProvider } from "./notes.providers";

@Module({ controllers: [NotesController], providers: [notesProvider] })
export class NotesModule {}
