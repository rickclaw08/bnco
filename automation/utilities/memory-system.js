#!/usr/bin/env node
/**
 * Memory Context System
 * 
 * Enhanced memory management that indexes memory/*.md files.
 * Creates a searchable index with keyword search support.
 * Tracks which topics appear in which files.
 * Rebuilds index on every run.
 * 
 * Environment Variables:
 *   WORKSPACE_DIR  - Workspace root (defaults to ../../ relative to this file)
 *   MEMORY_DIR     - Memory directory (defaults to WORKSPACE_DIR/memory)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const WORKSPACE = process.env.WORKSPACE_DIR || path.resolve(__dirname, '../..');
const MEMORY_DIR = process.env.MEMORY_DIR || path.join(WORKSPACE, 'memory');
const DATA_DIR = path.join(__dirname, 'data');
const INDEX_FILE = path.join(DATA_DIR, 'memory-index.json');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'memory-system.log');

// Common stop words to exclude from keyword indexing
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'it', 'its',
  'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our',
  'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them',
  'their', 'what', 'which', 'who', 'whom', 'when', 'where', 'why',
  'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'about', 'also', 'then',
  'there', 'here', 'if', 'as', 'up', 'out', 'any', 'into', 'over',
]);

// Minimum word length for indexing
const MIN_WORD_LENGTH = 3;

/**
 * Logger utility
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  console.log(line);
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (err) {
    console.error(`Failed to write log: ${err.message}`);
  }
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w));

  // Count word frequencies
  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }
  return freq;
}

/**
 * Extract topics/headings from markdown content
 */
function extractTopics(content) {
  const topics = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      topics.push({
        level: headingMatch[1].length,
        title: headingMatch[2].trim(),
      });
    }
  }

  return topics;
}

/**
 * Extract a brief summary from content (first meaningful paragraph)
 */
function extractSummary(content, maxLength = 200) {
  const lines = content.split('\n').filter(l => {
    const trimmed = l.trim();
    return trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('---');
  });

  const summary = lines.slice(0, 3).join(' ').trim();
  if (summary.length > maxLength) {
    return summary.slice(0, maxLength) + '...';
  }
  return summary || 'No summary available';
}

/**
 * Parse a date from filename if possible (YYYY-MM-DD format)
 */
function parseDateFromFilename(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

/**
 * Index a single memory file
 */
function indexFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const stats = fs.statSync(filePath);

  const keywords = extractKeywords(content);
  const topics = extractTopics(content);
  const summary = extractSummary(content);
  const date = parseDateFromFilename(filename);

  // Get top keywords (sorted by frequency)
  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }));

  return {
    file: filename,
    path: filePath,
    date,
    modifiedAt: stats.mtime.toISOString(),
    sizeBytes: stats.size,
    lineCount: content.split('\n').length,
    wordCount: content.split(/\s+/).length,
    summary,
    topics,
    topKeywords,
    allKeywords: keywords,
  };
}

/**
 * Build the inverted index (keyword -> files mapping)
 */
function buildInvertedIndex(fileEntries) {
  const inverted = {};

  for (const entry of fileEntries) {
    for (const [keyword, count] of Object.entries(entry.allKeywords)) {
      if (!inverted[keyword]) {
        inverted[keyword] = [];
      }
      inverted[keyword].push({
        file: entry.file,
        count,
      });
    }
  }

  // Sort each keyword's file list by frequency
  for (const keyword of Object.keys(inverted)) {
    inverted[keyword].sort((a, b) => b.count - a.count);
  }

  return inverted;
}

/**
 * Build topic index (topic -> files mapping)
 */
function buildTopicIndex(fileEntries) {
  const topicMap = {};

  for (const entry of fileEntries) {
    for (const topic of entry.topics) {
      const key = topic.title.toLowerCase();
      if (!topicMap[key]) {
        topicMap[key] = [];
      }
      topicMap[key].push({
        file: entry.file,
        level: topic.level,
        title: topic.title,
      });
    }
  }

  return topicMap;
}

/**
 * Search the index for a keyword query
 */
function searchIndex(index, query) {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length >= 2);

  const results = {};

  for (const word of queryWords) {
    // Exact match
    if (index.invertedIndex[word]) {
      for (const entry of index.invertedIndex[word]) {
        if (!results[entry.file]) {
          results[entry.file] = { file: entry.file, score: 0, matchedKeywords: [] };
        }
        results[entry.file].score += entry.count;
        results[entry.file].matchedKeywords.push(word);
      }
    }

    // Partial match (prefix)
    for (const [keyword, entries] of Object.entries(index.invertedIndex)) {
      if (keyword.startsWith(word) && keyword !== word) {
        for (const entry of entries) {
          if (!results[entry.file]) {
            results[entry.file] = { file: entry.file, score: 0, matchedKeywords: [] };
          }
          results[entry.file].score += entry.count * 0.5; // Partial match gets lower score
          if (!results[entry.file].matchedKeywords.includes(keyword)) {
            results[entry.file].matchedKeywords.push(keyword);
          }
        }
      }
    }
  }

  return Object.values(results).sort((a, b) => b.score - a.score);
}

/**
 * Main indexing function
 */
function buildIndex() {
  const startTime = Date.now();
  log('INFO', '=== Memory Index Build Started ===');
  log('INFO', `Memory directory: ${MEMORY_DIR}`);

  // Ensure directories exist
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(MEMORY_DIR)) {
    log('WARN', `Memory directory does not exist: ${MEMORY_DIR}`);
    log('INFO', 'Creating empty index.');
    const emptyIndex = {
      buildTime: new Date().toISOString(),
      files: [],
      invertedIndex: {},
      topicIndex: {},
      stats: { totalFiles: 0, totalWords: 0, totalKeywords: 0 },
    };
    fs.writeFileSync(INDEX_FILE, JSON.stringify(emptyIndex, null, 2));
    return emptyIndex;
  }

  // Find all .md files in memory directory
  const mdFiles = fs.readdirSync(MEMORY_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(MEMORY_DIR, f))
    .sort();

  log('INFO', `Found ${mdFiles.length} markdown file(s) to index.`);

  // Index each file
  const fileEntries = [];
  for (const filePath of mdFiles) {
    try {
      const entry = indexFile(filePath);
      fileEntries.push(entry);
      log('INFO', `Indexed: ${entry.file} (${entry.wordCount} words, ${entry.topics.length} topics)`);
    } catch (err) {
      log('ERROR', `Failed to index ${filePath}: ${err.message}`);
    }
  }

  // Build inverted index
  const invertedIndex = buildInvertedIndex(fileEntries);
  const topicIndex = buildTopicIndex(fileEntries);

  // Strip allKeywords from file entries for the output (it is in the inverted index)
  const cleanEntries = fileEntries.map(entry => {
    const { allKeywords, ...rest } = entry;
    return rest;
  });

  // Calculate stats
  const totalWords = fileEntries.reduce((sum, e) => sum + e.wordCount, 0);
  const totalKeywords = Object.keys(invertedIndex).length;

  const index = {
    buildTime: new Date().toISOString(),
    stats: {
      totalFiles: fileEntries.length,
      totalWords,
      totalKeywords,
      uniqueTopics: Object.keys(topicIndex).length,
    },
    files: cleanEntries,
    invertedIndex,
    topicIndex,
  };

  // Write index file
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  log('INFO', `Index written to: ${INDEX_FILE}`);
  log('INFO', `Stats: ${fileEntries.length} files, ${totalWords} words, ${totalKeywords} unique keywords, ${Object.keys(topicIndex).length} topics`);
  log('INFO', `=== Memory Index Build Complete (${elapsed}s) ===`);

  return index;
}

// CLI interface
const args = process.argv.slice(2);

if (args[0] === 'search' && args[1]) {
  // Search mode: node memory-system.js search "query"
  const query = args.slice(1).join(' ');

  if (!fs.existsSync(INDEX_FILE)) {
    console.log('Index not found. Building first...');
    buildIndex();
  }

  const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  const results = searchIndex(index, query);

  if (results.length === 0) {
    console.log(`No results found for: "${query}"`);
  } else {
    console.log(`\nSearch results for: "${query}"\n`);
    for (const result of results.slice(0, 10)) {
      const fileInfo = index.files.find(f => f.file === result.file);
      console.log(`  ${result.file} (score: ${result.score.toFixed(1)})`);
      console.log(`    Keywords: ${result.matchedKeywords.join(', ')}`);
      if (fileInfo) {
        console.log(`    Summary: ${fileInfo.summary}`);
      }
      console.log('');
    }
  }
} else if (args[0] === 'topics') {
  // Topics mode: node memory-system.js topics
  if (!fs.existsSync(INDEX_FILE)) {
    console.log('Index not found. Building first...');
    buildIndex();
  }

  const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  console.log('\nAll topics across memory files:\n');
  for (const [topic, files] of Object.entries(index.topicIndex).sort()) {
    const fileList = files.map(f => f.file).join(', ');
    console.log(`  ${files[0].title}`);
    console.log(`    Found in: ${fileList}`);
    console.log('');
  }
} else if (args[0] === 'stats') {
  // Stats mode
  if (!fs.existsSync(INDEX_FILE)) {
    console.log('Index not found. Run without arguments to build.');
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  console.log('\nMemory Index Statistics:\n');
  console.log(`  Build time:       ${index.buildTime}`);
  console.log(`  Total files:      ${index.stats.totalFiles}`);
  console.log(`  Total words:      ${index.stats.totalWords}`);
  console.log(`  Unique keywords:  ${index.stats.totalKeywords}`);
  console.log(`  Unique topics:    ${index.stats.uniqueTopics}`);
  console.log('');
} else {
  // Default: build/rebuild index
  buildIndex();
}
