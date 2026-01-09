import React from 'react';

export enum PipelineStep {
  IDLE = 'IDLE',
  INGESTION = 'INGESTION',
  CHUNKING = 'CHUNKING',
  EMBEDDING = 'EMBEDDING',
  CLUSTERING = 'CLUSTERING',
  RETRIEVAL = 'RETRIEVAL',
  REASONING = 'REASONING',
  COMPLETE = 'COMPLETE'
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  chunkCount: number;
  status: 'pending' | 'processed';
  text?: string;
}

export interface CharacterTest {
  id: string;
  bookName: string;
  character: string;
  claim: string;
  retrievedContext: string[];
  prediction?: 0 | 1;
  rationale?: string;
  confidence?: number;
}

export interface TrainItem {
  id: string;
  label: 0 | 1 | string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ElementType;
}