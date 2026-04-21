package utils

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// TransactionRunner helper cho database transactions
type TransactionRunner struct {
	db *mongo.Database
}

func NewTransactionRunner(db *mongo.Database) *TransactionRunner {
	return &TransactionRunner{db: db}
}

// RunTransaction thực hiện operations trong transaction
func (tr *TransactionRunner) RunTransaction(ctx context.Context, fn func(sessCtx mongo.SessionContext) error) error {
	session, err := tr.db.Client().StartSession()
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, func(sessCtx mongo.SessionContext) (interface{}, error) {
		return nil, fn(sessCtx)
	})

	return err
}

// BatchInsertMany insert nhiều documents vào collection
func BatchInsertMany(ctx context.Context, coll *mongo.Collection, docs []interface{}) error {
	if len(docs) == 0 {
		return nil
	}
	_, err := coll.InsertMany(ctx, docs)
	return err
}

// UpdateOneWithOption update với options
func UpdateOneWithOption(ctx context.Context, coll *mongo.Collection, filter, update bson.M, opts ...*options.UpdateOptions) error {
	result, err := coll.UpdateOne(ctx, filter, update, opts...)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("no document matched")
	}
	return nil
}
