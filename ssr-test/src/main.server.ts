import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

export default function bootstrap(context: unknown) {
	return bootstrapApplication(App, config, context as any);
}
