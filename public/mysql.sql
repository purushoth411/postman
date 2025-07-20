CREATE TABLE tbl_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE tbl_collections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);


CREATE TABLE tbl_api_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    collection_id INT,
    user_id INT,
    name VARCHAR(255),
    method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'),
    url TEXT,
    body TEXT,
    response TEXT,
    response_code INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES tbl_collections(id) ON DELETE SET NULL
);


CREATE TABLE tbl_request_headers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT,
    header_key VARCHAR(255),
    header_value TEXT,
    FOREIGN KEY (request_id) REFERENCES tbl_api_requests(id) ON DELETE CASCADE
);


CREATE TABLE tbl_environments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(100),
    variables TEXT, -- store JSON: {"base_url": "https://api.example.com"}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);


CREATE TABLE tbl_request_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    request_id INT,
    url TEXT,
    method VARCHAR(10),
    body TEXT,
    response TEXT,
    status_code INT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES tbl_api_requests(id) ON DELETE SET NULL
);
