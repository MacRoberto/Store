<?php

return [
    'name' => [
        'label' => 'category name',
        'required' => true,
        'type' => 'string',
        'minLength' => 2,
        'maxLength' => 100,

        'messages' => [
            'required' => 'Category name is required.',
            'minLength' => 'Category name must contain at least 2 characters.',
            'maxLength' => 'Category name must not exceed 100 characters.'
        ]
    ],

    'description' => [
        'label' => 'description',
        'required' => false,
        'type' => 'string',
        'maxLength' => 255,

        'messages' => [
            'type' => 'Description must be a valid text string.',
            'maxLength' => 'Description must not exceed 255 characters.'
        ]
    ]
];