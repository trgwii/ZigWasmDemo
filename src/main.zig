const std = @import("std");

extern fn print([*:0]const u8) void;
extern fn alloc(bytes: u32) [*]u8;

const allocator = std.heap.page_allocator;

export fn resizeScreen(width: u32, height: u32, screen: ?[*]u32) ?[*]u32 {
    if (screen) |s| allocator.free(@ptrCast(*[1]u32, s));
    const result = allocator.alloc(u32, width * height) catch {
        print("resizeScreen failed!");
        return null;
    };
    return result.ptr;
}

const Keys = struct {
    Up: bool,
    Left: bool,
    Down: bool,
    Right: bool,
};

export fn setKeys(key: u32, down: u32, handle: ?*Keys) ?*Keys {
    if (handle) |keys| {
        // var buf: [1024:0]u8 = undefined;
        // _ = std.fmt.bufPrint(&buf, "{any}\x00", .{keys}) catch unreachable;
        // print(&buf);
        if (key == 0) keys.Up = down == 1;
        if (key == 1) keys.Left = down == 1;
        if (key == 2) keys.Down = down == 1;
        if (key == 3) keys.Right = down == 1;
        return keys;
    } else {
        const keys = allocator.create(Keys) catch {
            print("setKeys failed!");
            return null;
        };
        if (key == 0) keys.Up = down == 1;
        if (key == 1) keys.Left = down == 1;
        if (key == 2) keys.Down = down == 1;
        if (key == 3) keys.Right = down == 1;
        return keys;
    }
}

const Game = struct {
    player: struct {
        x: u32,
        y: u32,
    },
};

export fn update(game: ?*Game, keys: *Keys) ?*Game {
    if (game) |g| {
        g.player.y += @as(u32, @boolToInt(keys.Down)) - @as(u32, @boolToInt(keys.Up));
        g.player.x += @as(u32, @boolToInt(keys.Right)) - @as(u32, @boolToInt(keys.Left));
        return g;
    } else {
        const result = allocator.create(Game) catch {
            print("update failed!");
            return null;
        };
        result.player.x = 0;
        result.player.y = 0;
        return result;
    }
}

export fn render(game: *Game, mem: [*]u32, width: u32, height: u32) void {
    var y: u32 = 0;
    while (y < height) : (y += 1) {
        var x: u32 = 0;
        while (x < width) : (x += 1) {
            mem[y * width + x] = 0xFF0000FF;
        }
    }
    var pY: u32 = 0;
    while (pY < 10) : (pY += 1) {
        var pX: u32 = 0;
        while (pX < 10) : (pX += 1) {
            print(&[_:0]u8{@intCast(u8, game.player.y) + '0'});
            mem[(game.player.y + pY) * width + (game.player.x + pX)] = 0x0000FFFF;
        }
    }
}
