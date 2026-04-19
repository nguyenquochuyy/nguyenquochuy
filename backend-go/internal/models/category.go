package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Category struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	CategoryID      string             `bson:"id" json:"id"`
	Name            string             `bson:"name" json:"name"`
	Description     string             `bson:"description,omitempty" json:"description,omitempty"`
	Order           int                `bson:"order" json:"order"`
	ParentID        string             `bson:"parentId,omitempty" json:"parentId,omitempty"`
	IsActive        bool               `bson:"isActive" json:"isActive"`
	Image           string             `bson:"image,omitempty" json:"image,omitempty"`
	Banner          string             `bson:"banner,omitempty" json:"banner,omitempty"`
	MetaTitle       string             `bson:"metaTitle,omitempty" json:"metaTitle,omitempty"`
	MetaDescription string             `bson:"metaDescription,omitempty" json:"metaDescription,omitempty"`
	Slug            string             `bson:"slug,omitempty" json:"slug,omitempty"`
	CreatedAt       string             `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt       string             `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}
