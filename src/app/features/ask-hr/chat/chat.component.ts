import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatService } from '../../../core/services/chat.service';
import { ChatMessage } from '../../../core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  private readonly chatService = inject(ChatService);

  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;

  readonly messages = signal<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        "Hi! I'm the HR Policy Assistant. Ask me anything about company policy — PTO, remote work, " +
        'benefits, conduct — and I\'ll answer using the current, approved policy documents with citations.',
      timestamp: new Date().toISOString(),
    },
  ]);
  readonly draft = signal('');
  readonly sending = signal(false);

  readonly suggestions = [
    'How much PTO do I accrue per year?',
    'Can I work remotely full-time?',
    'What is the carryover policy for unused vacation days?',
  ];

  ask(question?: string): void {
    const text = (question ?? this.draft()).trim();
    if (!text || this.sending()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    this.messages.update((list) => [...list, userMessage]);
    this.draft.set('');
    this.sending.set(true);
    this.scrollToBottom();

    this.chatService.ask(text).subscribe((answer) => {
      this.messages.update((list) => [...list, answer]);
      this.sending.set(false);
      this.scrollToBottom();
    });
  }

  onEnter(event: Event): void {
    event.preventDefault();
    this.ask();
  }

  private scrollToBottom(): void {
    queueMicrotask(() => {
      this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }
}
