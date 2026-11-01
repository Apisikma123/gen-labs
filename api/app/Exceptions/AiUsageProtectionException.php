<?php

namespace App\Exceptions;

use Exception;

class AiUsageProtectionException extends Exception
{
    private int $statusCode;
    private array $payload;

    public function __construct(int $statusCode, array $payload)
    {
        parent::__construct($payload['message'] ?? 'AI Usage Protection Exception', $statusCode);
        $this->statusCode = $statusCode;
        $this->payload = $payload;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getPayload(): array
    {
        return $this->payload;
    }
}
