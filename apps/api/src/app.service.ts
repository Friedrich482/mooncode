import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello() {
    return "Hello from the MoonCode API !";
  }

  health() {
    return { status: "OK" };
  }
}
