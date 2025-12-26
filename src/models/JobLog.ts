import mongoose, { Schema, Document } from 'mongoose';

export interface IJobLog extends Document {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobLogSchema: Schema = new Schema({
  jobId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  result: { type: Schema.Types.Mixed },
  error: { type: String },
}, { timestamps: true });

export default mongoose.model<IJobLog>('JobLog', JobLogSchema);
