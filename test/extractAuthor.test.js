import assert from 'node:assert';
import { describe, it } from 'node:test';
import { extractAuthor } from '../lib/extractAuthor.js';

describe('extractAuthor', () => {
  it('if its a string', () => {
    const author = extractAuthor({ author: 'John Doe' });

    assert.strictEqual(author, 'John Doe');
  });

  it('if its an object with name', () => {
    const packageJsonAuthor = {
      author: {
        name: 'Barney Rubble',
      },
    };
    const author = extractAuthor(packageJsonAuthor);

    assert.strictEqual(author, 'Barney Rubble');
  });

  it('if its an object with email', () => {
    const packageJsonAuthor = {
      author: {
        email: 'b@rubble.com',
      },
    };
    const author = extractAuthor(packageJsonAuthor);

    assert.strictEqual(author, 'b@rubble.com');
  });

  it('if its an object with name and email', () => {
    const packageJsonAuthor = {
      author: {
        name: 'Barney Rubble',
        email: 'b@rubble.com',
      },
    };
    const author = extractAuthor(packageJsonAuthor);

    assert.strictEqual(author, 'Barney Rubble b@rubble.com');
  });

  it('if its an object with name, email, url', () => {
    const packageJsonAuthor = {
      author: {
        name: 'Barney Rubble',
        email: 'b@rubble.com',
        url: 'http://barnyrubble.tumblr.com/',
      },
    };
    const author = extractAuthor(packageJsonAuthor);

    assert.strictEqual(author, 'Barney Rubble b@rubble.com http://barnyrubble.tumblr.com/');
  });

  it('if no author field is present', () => {
    const author = extractAuthor({});

    assert.strictEqual(author, 'n/a');
  });
});
