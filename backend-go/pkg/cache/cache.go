package cache

import (
	"encoding/json"
	"sync"
	"time"
)

// Cache interface — dễ swap Redis sau này
type Cache interface {
	Get(key string) ([]byte, bool)
	Set(key string, value []byte, ttl time.Duration)
	Delete(key string)
	DeletePrefix(prefix string)
}

// entry là một item trong memory cache
type entry struct {
	data      []byte
	expiresAt time.Time
}

// MemoryCache dùng sync.Map — thread-safe, không cần Redis
type MemoryCache struct {
	mu    sync.RWMutex
	store map[string]entry
	keys  []string
}

func NewMemoryCache() *MemoryCache {
	mc := &MemoryCache{
		store: make(map[string]entry),
	}
	go mc.cleanupLoop()
	return mc
}

func (m *MemoryCache) Get(key string) ([]byte, bool) {
	m.mu.RLock()
	e, ok := m.store[key]
	m.mu.RUnlock()
	if !ok || time.Now().After(e.expiresAt) {
		return nil, false
	}
	return e.data, true
}

func (m *MemoryCache) Set(key string, value []byte, ttl time.Duration) {
	m.mu.Lock()
	m.store[key] = entry{data: value, expiresAt: time.Now().Add(ttl)}
	m.keys = append(m.keys, key)
	m.mu.Unlock()
}

func (m *MemoryCache) Delete(key string) {
	m.mu.Lock()
	delete(m.store, key)
	m.mu.Unlock()
}

func (m *MemoryCache) DeletePrefix(prefix string) {
	m.mu.Lock()
	for k := range m.store {
		if len(k) >= len(prefix) && k[:len(prefix)] == prefix {
			delete(m.store, k)
		}
	}
	m.mu.Unlock()
}

// cleanupLoop xóa các entry đã hết hạn mỗi 5 phút
func (m *MemoryCache) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		now := time.Now()
		m.mu.Lock()
		for k, e := range m.store {
			if now.After(e.expiresAt) {
				delete(m.store, k)
			}
		}
		m.mu.Unlock()
	}
}

// MarshalJSON tiện ích để cache bất kỳ struct nào
func Marshal(v any) ([]byte, error) {
	return json.Marshal(v)
}

func Unmarshal(data []byte, v any) error {
	return json.Unmarshal(data, v)
}
