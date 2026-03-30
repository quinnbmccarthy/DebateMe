#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
#include <arpa/inet.h>

#define PORT 8080
#define MAX_CLIENTS 100

typedef struct {
    int socket;
    char username[50];
    char room[50];
} Client;

Client clients[MAX_CLIENTS];
int client_count = 0;

pthread_mutex_t lock;

void broadcast(char *message, char *room, int sender) {
    pthread_mutex_lock(&lock);
    for (int i = 0; i < client_count; i++) {
        if (strcmp(clients[i].room, room) == 0) {
            send(clients[i].socket, message, strlen(message), 0);
        }
    }
    pthread_mutex_unlock(&lock);
}

void remove_client(int sock) {
    pthread_mutex_lock(&lock);
    for (int i = 0; i < client_count; i++) {
        if (clients[i].socket == sock) {
            clients[i] = clients[client_count - 1];
            client_count--;
            break;
        }
    }
    pthread_mutex_unlock(&lock);
}

void *handle_client(void *arg) {
    int sock = *(int *)arg;
    free(arg);

    char buffer[1024];

    // First message = username|room
    int len = recv(sock, buffer, sizeof(buffer), 0);
    if (len <= 0) return NULL;

    buffer[len] = '\0';

    char username[50], room[50];
    sscanf(buffer, "%49[^|]|%49s", username, room);

    pthread_mutex_lock(&lock);
    clients[client_count].socket = sock;
    strcpy(clients[client_count].username, username);
    strcpy(clients[client_count].room, room);
    client_count++;
    pthread_mutex_unlock(&lock);

    printf("%s joined room %s\n", username, room);

    while (1) {
        len = recv(sock, buffer, sizeof(buffer), 0);
        if (len <= 0) break;

        buffer[len] = '\0';

        char full_msg[1100];
        snprintf(full_msg, sizeof(full_msg), "%s: %s", username, buffer);

        broadcast(full_msg, room, sock);
    }

    printf("%s left\n", username);
    remove_client(sock);
    close(sock);
    return NULL;
}

int main() {
    int server_fd;
    struct sockaddr_in address;

    pthread_mutex_init(&lock, NULL);

    server_fd = socket(AF_INET, SOCK_STREAM, 0);

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    bind(server_fd, (struct sockaddr *)&address, sizeof(address));
    listen(server_fd, 10);

    printf("C server running on port %d\n", PORT);

    while (1) {
        int *new_sock = malloc(sizeof(int));
        *new_sock = accept(server_fd, NULL, NULL);

        pthread_t tid;
        pthread_create(&tid, NULL, handle_client, new_sock);
    }
}