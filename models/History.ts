import mongoose, { Schema, Document, Model } from 'mongoose';
import { HttpMethod } from './Request';

export interface IHistoryResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
  size: number;
}

export interface IHistory extends Document {
  _id: mongoose.Types.ObjectId;
  method: HttpMethod;
  url: string;
  params: Array<{ key: string; value: string; enabled: boolean }>;
  headers: Array<{ key: string; value: string; enabled: boolean }>;
  body?: string;
  response: IHistoryResponse;
  workspace: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
}

const HistorySchema = new Schema<IHistory>(
  {
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    params: [{
      key: String,
      value: String,
      enabled: Boolean,
    }],
    headers: [{
      key: String,
      value: String,
      enabled: Boolean,
    }],
    body: String,
    response: {
      status: Number,
      statusText: String,
      headers: Schema.Types.Mixed,
      data: Schema.Types.Mixed,
      time: Number,
      size: Number,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for faster queries and automatic cleanup
HistorySchema.index({ owner: 1, createdAt: -1 });
HistorySchema.index({ workspace: 1, createdAt: -1 });

// TTL index - automatically delete history older than 30 days
HistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const History: Model<IHistory> = mongoose.models.History || mongoose.model<IHistory>('History', HistorySchema);

export default History;
