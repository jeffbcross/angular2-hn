import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";

@NgModule({
  imports: [
    AppModule,
    ServerModule
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule {}