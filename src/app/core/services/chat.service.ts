import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { ChatMessage, Citation } from '../models/chat.model';

/**
 * In-memory implementation so the UI is demoable before the RAG
 * pipeline (Textract → Titan Embed → OpenSearch → Claude) is wired up.
 * Swap ask() for an HttpClient POST to environment.apiBaseUrl + '/chat'.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  ask(question: string): Observable<ChatMessage> {
    const answer = buildMockAnswer(question);
    return of(answer).pipe(delay(900));
  }
}

function buildMockAnswer(question: string): ChatMessage {
  const lower = question.toLowerCase();

  let text = `Based on current policy, here's what applies to your question about "${question}". `;
  let citations: Citation[];

  if (lower.includes('pto') || lower.includes('vacation') || lower.includes('time off')) {
    text +=
      'Full-time employees accrue PTO at 1.67 days per month (20 days/year), capped at 240 hours. ' +
      'Unused PTO up to 40 hours may be carried over into the next calendar year.';
    citations = [{ documentName: 'Paid Time Off Policy', section: '§3.2 Accrual & Carryover', version: 3 }];
  } else if (lower.includes('remote') || lower.includes('work from home') || lower.includes('wfh')) {
    text +=
      'Employees may work remotely up to 3 days per week with manager approval. Fully remote arrangements ' +
      'require VP-level sign-off and are reviewed quarterly.';
    citations = [{ documentName: 'Remote Work Policy', section: '§2.1 Eligibility', version: 1 }];
  } else {
    text +=
      'This is a mocked response for UI development — once the RAG pipeline is connected, this answer ' +
      'will be grounded in retrieved chunks from the active policy documents.';
    citations = [{ documentName: 'Employee Handbook', section: '§1.0 Overview', version: 1 }];
  }

  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    text,
    citations,
    timestamp: new Date().toISOString(),
  };
}
