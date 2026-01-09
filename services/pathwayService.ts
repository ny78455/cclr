import { PipelineStep } from '../types';

/**
 * Service to interact with the Pathway backend.
 * Pathway provides a reactive data processing engine that handles
 * ingestion, embedding, and indexing in real-time.
 */
class PathwayService {
  private listeners: ((step: PipelineStep) => void)[] = [];
  private isConnected: boolean = false;

  constructor() {
    // Simulate connection latency
    setTimeout(() => {
      this.isConnected = true;
      console.log('Pathway WebSocket Connected');
    }, 500);
  }

  subscribe(callback: (step: PipelineStep) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(step: PipelineStep) {
    this.listeners.forEach(l => l(step));
  }

  async processDataPipeline() {
    if (!this.isConnected) {
      console.warn('Waiting for Pathway connection...');
      await this.wait(500);
    }

    // Simulate Pathway's streaming pipeline execution
    // 1. Ingestion: Reading data from the connector (Files/Kafka/S3)
    this.notify(PipelineStep.INGESTION);
    await this.wait(1500);
    
    // 2. Transformation: Chunking and Formatting
    this.notify(PipelineStep.CHUNKING);
    await this.wait(1200);
    
    // 3. Vectorization: Computing Embeddings (using model specified in Pathway)
    this.notify(PipelineStep.EMBEDDING);
    await this.wait(1800);
    
    // 4. Indexing: Updating the KNN index structure
    this.notify(PipelineStep.CLUSTERING);
    await this.wait(1500);
    
    // 5. Retrieval: Fetching relevant context for the queries
    this.notify(PipelineStep.RETRIEVAL);
    await this.wait(1200);
    
    // Ready for reasoning agent to consume
    this.notify(PipelineStep.REASONING);
  }

  private wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const pathwayService = new PathwayService();
