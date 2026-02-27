import { registerAs } from '@nestjs/config';

export interface IRabbitmqConfig {
    url: string;
    postWorkerQueue: string;
}

export default registerAs(
    'rabbitmq',
    (): IRabbitmqConfig => ({
        url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
        postWorkerQueue: process.env.RABBITMQ_POST_WORKER_QUEUE || 'post_worker_queue',
    }),
);
