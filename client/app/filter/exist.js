'use strict';

angular.module('keepballin').filter('exist', function() {
    return function(input) {
        return input ? '有' : '無';
    };
});